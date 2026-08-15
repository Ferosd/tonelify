import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, PLANS, getPriceId, isPurchasablePlan, type BillingInterval } from "@/lib/stripe";
import { ensureCustomer, findCustomerIds, findLiveSubscription, hasPriorSubscription } from "@/lib/stripe-customer";
import { SITE_URL } from "@/lib/site";


const INTERVALS: BillingInterval[] = ["week", "month", "year"];

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId, interval, annual } = await req.json();

        // Validate plan
        if (!isPurchasablePlan(planId)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const plan = PLANS[planId];

        // `interval` is the current contract; `annual` is the older boolean and
        // is still honoured so a cached client bundle keeps working.
        const requested: BillingInterval =
            INTERVALS.includes(interval) ? interval
                : planId === "weekly" ? "week"
                    : annual ? "year" : "month";

        const priceId = getPriceId(planId, requested);

        if (!priceId) {
            console.error(`Missing price id for plan ${planId} / ${requested}`);
            return NextResponse.json(
                { error: "That plan isn't available right now. Try again shortly." },
                { status: 400 }
            );
        }

        // Determine base URL
        const baseUrl = SITE_URL || req.headers.get("origin") || "http://localhost:3000";

        const clerkUser = await currentUser();
        const email = clerkUser?.primaryEmailAddress?.emailAddress
            ?? clerkUser?.emailAddresses?.[0]?.emailAddress
            ?? null;

        // Every customer record this person could be billed under, not just the
        // one the database happens to know about. Three records for one email is
        // exactly how the same user ended up paying twice a month.
        const customerIds = await findCustomerIds(userId, email);

        // Guard against double billing: one live subscription per user, always.
        // A second purchase attempt goes to the Billing Portal, which switches
        // the plan on the EXISTING subscription with proration, rather than
        // stacking a new one beside it.
        const liveSub = await findLiveSubscription(customerIds);
        if (liveSub) {
            try {
                const portal = await stripe.billingPortal.sessions.create({
                    customer: liveSub.customerId,
                    return_url: `${baseUrl}/plans`,
                });
                return NextResponse.json({ url: portal.url, reason: "existing_subscription" });
            } catch (portalError) {
                console.error("Billing portal error for subscribed user:", portalError);
                return NextResponse.json(
                    { error: "You already have an active subscription. Manage your plan from Settings." },
                    { status: 409 }
                );
            }
        }

        // Returning customers (expired/canceled) don't get a second free trial,
        // and the Week Pass never carries one
        const isReturningCustomer = customerIds.length > 0 && await hasPriorSubscription(customerIds);
        const trialDays = isReturningCustomer ? 0 : plan.trialDays;

        const sessionParams: any = {
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?checkout=success&plan=${planId}`,
            cancel_url: `${baseUrl}/plans?checkout=canceled`,
            metadata: {
                userId,
                planId,
            },
            subscription_data: {
                metadata: {
                    userId,
                    planId,
                },
                ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
            },
            allow_promotion_codes: true,
        };

        // Always bill against one resolved customer. Letting Checkout mint its
        // own customer, which is what happened whenever this field was left
        // empty, is how one person collected three customer records.
        sessionParams.customer = await ensureCustomer(userId, email);
        sessionParams.client_reference_id = userId;

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
