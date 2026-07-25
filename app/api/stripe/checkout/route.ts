import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS, getPriceId, isPurchasablePlan, type BillingInterval } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

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
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";

        const { data: existing } = await getSupabaseAdmin()
            .from("user_subscriptions")
            .select("stripe_customer_id, stripe_subscription_id")
            .eq("user_id", userId)
            .single();

        // Guard against double billing: if the user already has a live
        // subscription in Stripe, never open a second subscription checkout.
        // Send them to the Billing Portal, which changes the plan on the
        // EXISTING subscription (prorated) instead of stacking a new one.
        if (existing?.stripe_subscription_id) {
            let liveSub: any = null;
            try {
                liveSub = await stripe.subscriptions.retrieve(existing.stripe_subscription_id);
            } catch {
                // Subscription no longer exists in Stripe — a fresh checkout is safe
            }

            if (liveSub && ["active", "trialing", "past_due", "unpaid"].includes(liveSub.status)) {
                const customerId =
                    (typeof liveSub.customer === "string" ? liveSub.customer : liveSub.customer?.id) ||
                    existing.stripe_customer_id;
                try {
                    const portal = await stripe.billingPortal.sessions.create({
                        customer: customerId,
                        return_url: `${baseUrl}/plans`,
                    });
                    return NextResponse.json({ url: portal.url });
                } catch (portalError) {
                    console.error("Billing portal error for subscribed user:", portalError);
                    return NextResponse.json(
                        { error: "You already have an active subscription. Manage your plan from Settings." },
                        { status: 409 }
                    );
                }
            }
        }

        // Returning customers (expired/canceled) don't get a second free trial,
        // and the Week Pass never carries one
        const isReturningCustomer = !!existing;
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

        // Reuse the user's Stripe customer so all their billing lives on one record
        if (existing?.stripe_customer_id) {
            sessionParams.customer = existing.stripe_customer_id;
        }

        let session;
        try {
            session = await stripe.checkout.sessions.create(sessionParams);
        } catch (createError) {
            // Stale/deleted customer reference — retry once with a fresh customer
            if (sessionParams.customer) {
                delete sessionParams.customer;
                session = await stripe.checkout.sessions.create(sessionParams);
            } else {
                throw createError;
            }
        }

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
