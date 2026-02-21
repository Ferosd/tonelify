import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: any;

    try {
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(
                body,
                signature!,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            event = JSON.parse(body);
        }
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
            const subscriptionId = obj?.subscription;
            const customerId = obj?.customer;

            console.log(`[Webhook] userId: ${userId}, planId: ${planId}, subId: ${subscriptionId}`);

            if (!userId || !planId) {
                console.log("[Webhook] Missing userId or planId in metadata");
                return NextResponse.json({ received: true, skipped: "missing metadata" });
            }

            let periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            if (subscriptionId) {
                try {
                    const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
                    if (sub.current_period_end) {
                        periodEnd = new Date(sub.current_period_end * 1000);
                    }
                } catch (subErr: any) {
                    console.error("[Webhook] Failed to retrieve subscription:", subErr.message);
                }
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
            const subscriptionId = obj?.subscription;
            if (!subscriptionId) {
                return NextResponse.json({ received: true });
            }

            try {
                const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
                const userId = sub.metadata?.userId;
                const planId = sub.metadata?.planId;

                if (userId && planId) {
                    const periodEnd = sub.current_period_end
                        ? new Date(sub.current_period_end * 1000)
                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                    await getSupabaseAdmin()
                        .from("user_subscriptions")
                        .upsert({
                            user_id: userId,
                            stripe_customer_id: obj.customer || null,
                            stripe_subscription_id: subscriptionId,
                            plan: planId,
                            status: "active",
                            current_period_end: periodEnd.toISOString(),
                            cancel_at_period_end: false,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: "user_id" });

                    console.log(`[Webhook] ✅ Renewed: ${userId} → ${planId}`);
                }
            } catch (err: any) {
                console.error("[Webhook] invoice error:", err.message);
            }
        }

        else if (eventType === "customer.subscription.updated") {
            if (obj?.cancel_at_period_end) {
                await getSupabaseAdmin()
                    .from("user_subscriptions")
                    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
                    .eq("stripe_subscription_id", obj.id);
            }
        }

        else if (eventType === "customer.subscription.deleted") {
            await getSupabaseAdmin()
                .from("user_subscriptions")
                .update({ plan: "free", status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString() })
                .eq("stripe_subscription_id", obj.id);
        }

    } catch (error: any) {
        console.error("[Webhook] Error:", error.message);
        return NextResponse.json({ received: true, error: error.message });
    }

    return NextResponse.json({ received: true });
}
