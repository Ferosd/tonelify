import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { setUserSubscription } from "@/lib/subscription";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;

    try {
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(
                body,
                signature!,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            // In development without webhook secret, parse directly
            event = JSON.parse(body);
        }
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                const planId = session.metadata?.planId;

                if (userId && planId && session.subscription) {
                    // Get subscription details from Stripe
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    ) as any;

                    await setUserSubscription(
                        userId,
                        planId as any,
                        session.customer as string,
                        subscription.id,
                        new Date(subscription.current_period_end * 1000)
                    );

                    console.log(`✅ Subscription activated: ${userId} → ${planId}`);
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    ) as any;
                    const userId = subscription.metadata?.userId;
                    const planId = subscription.metadata?.planId;

                    if (userId && planId) {
                        await setUserSubscription(
                            userId,
                            planId as any,
                            invoice.customer as string,
                            subscription.id,
                            new Date(subscription.current_period_end * 1000)
                        );

                        console.log(`✅ Subscription renewed: ${userId} → ${planId}`);
                    }
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    // Check if subscription was canceled
                    if (subscription.cancel_at_period_end) {
                        await supabase
                            .from("user_subscriptions")
                            .update({
                                cancel_at_period_end: true,
                                updated_at: new Date().toISOString(),
                            })
                            .eq("stripe_subscription_id", subscription.id);

                        console.log(`⚠️ Subscription will cancel at period end: ${userId}`);
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    // Downgrade to hobby
                    await supabase
                        .from("user_subscriptions")
                        .update({
                            plan: "hobby",
                            status: "canceled",
                            cancel_at_period_end: false,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("stripe_subscription_id", subscription.id);

                    console.log(`❌ Subscription canceled: ${userId} → hobby`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
