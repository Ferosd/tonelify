import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
    subscriptionPeriodEnd,
    periodEndFromPrice,
    invoiceSubscriptionId,
    idOf,
} from "@/lib/stripe-events";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: any;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting event");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventType = event.type;
    const obj = event.data?.object;

    console.log(`[Stripe Webhook] Event: ${eventType}`);

    try {
        if (eventType === "checkout.session.completed") {
            const userId = obj?.metadata?.userId;
            const planId = obj?.metadata?.planId;
            const subscriptionId = idOf(obj?.subscription);
            const customerId = idOf(obj?.customer);

            console.log(`[Webhook] userId: ${userId}, planId: ${planId}, subId: ${subscriptionId}`);

            if (!userId || !planId) {
                console.log("[Webhook] Missing userId or planId in metadata");
                return NextResponse.json({ received: true, skipped: "missing metadata" });
            }

            // Access has to end when the customer stopped paying for it. Guessing
            // a month here is what handed a Week Pass four weeks of the product.
            let periodEnd: Date | null = null;

            if (subscriptionId) {
                try {
                    const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
                    periodEnd = subscriptionPeriodEnd(sub) ?? periodEndFromPrice(sub);
                } catch (subErr: any) {
                    console.error("[Webhook] Failed to retrieve subscription:", subErr.message);
                }
            }

            if (!periodEnd) {
                // Nothing to go on. Retry rather than write a made-up period —
                // Stripe redelivers, and the row stays absent until we know.
                console.error(`[Webhook] No period end for ${userId} / sub ${subscriptionId}`);
                return NextResponse.json({ error: "Could not determine billing period" }, { status: 500 });
            }

            const { error: dbError } = await getSupabaseAdmin()
                .from("user_subscriptions")
                .upsert({
                    user_id: userId,
                    stripe_customer_id: customerId || null,
                    stripe_subscription_id: subscriptionId || null,
                    plan: planId,
                    status: "active",
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" });

            if (dbError) {
                console.error("[Webhook] DB error:", dbError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }

            console.log(`[Webhook] ✅ Activated: ${userId} → ${planId}`);
        }

        else if (eventType === "invoice.payment_succeeded") {
            // This is the handler that keeps a paying subscriber's access alive.
            // It read obj.subscription, which Stripe moved under obj.parent, so
            // it returned early on every renewal and nobody's period was extended.
            const subscriptionId = invoiceSubscriptionId(obj);
            if (!subscriptionId) {
                // A genuine one-off invoice, not a subscription renewal.
                return NextResponse.json({ received: true });
            }

            const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
            const userId = sub.metadata?.userId;
            const planId = sub.metadata?.planId;

            if (!userId || !planId) {
                console.error(`[Webhook] Renewal for ${subscriptionId} has no userId/planId metadata`);
                return NextResponse.json({ received: true, skipped: "missing metadata" });
            }

            const periodEnd = subscriptionPeriodEnd(sub) ?? periodEndFromPrice(sub);

            const { error: renewError } = await getSupabaseAdmin()
                .from("user_subscriptions")
                .upsert({
                    user_id: userId,
                    stripe_customer_id: idOf(obj?.customer),
                    stripe_subscription_id: subscriptionId,
                    plan: planId,
                    status: "active",
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: !!sub.cancel_at_period_end,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" });

            if (renewError) {
                // 500 so Stripe redelivers. Swallowing this used to drop a paid
                // renewal on any transient database error.
                console.error("[Webhook] Renewal DB error:", renewError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }

            console.log(`[Webhook] ✅ Renewed: ${userId} → ${planId} until ${periodEnd.toISOString()}`);
        }

        else if (eventType === "customer.subscription.updated") {
            // Sync plan changes made in the Billing Portal (monthly↔annual,
            // beginner↔expert), renewals, and cancel/resume — all on the
            // same subscription record
            const priceId = obj?.items?.data?.[0]?.price?.id;
            const match = priceId ? getPlanByPriceId(priceId) : null;

            const update: Record<string, any> = {
                cancel_at_period_end: !!obj?.cancel_at_period_end,
                updated_at: new Date().toISOString(),
            };
            if (match) update.plan = match.planId;

            const updatedEnd = subscriptionPeriodEnd(obj);
            if (updatedEnd) {
                update.current_period_end = updatedEnd.toISOString();
            }

            // past_due and unpaid are recorded as themselves: getUserSubscription
            // expires anything that isn't "active" the moment the period ends,
            // instead of extending it the three-day grace a live sub gets.
            if (obj?.status === "active" || obj?.status === "trialing") {
                update.status = "active";
            } else if (obj?.status) {
                update.status = obj.status;
            }

            const { error: syncError } = await getSupabaseAdmin()
                .from("user_subscriptions")
                .update(update)
                .eq("stripe_subscription_id", obj.id);

            if (syncError) {
                console.error("[Webhook] Subscription sync DB error:", syncError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }

            if (match) console.log(`[Webhook] ✅ Plan synced: sub ${obj.id} → ${match.planId}`);
        }

        else if (eventType === "customer.subscription.deleted") {
            const { error: cancelError } = await getSupabaseAdmin()
                .from("user_subscriptions")
                .update({ plan: "free", status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString() })
                .eq("stripe_subscription_id", obj.id);

            if (cancelError) {
                console.error("[Webhook] Cancellation DB error:", cancelError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
        }

    } catch (error: any) {
        // 200 here told Stripe the event was handled, so a failed write was never
        // redelivered — the payment went through and the account never saw it.
        console.error("[Webhook] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
