import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS, PlanId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId, annual } = await req.json();

        // Validate plan
        if (!planId || !["beginner", "expert"].includes(planId)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const plan = PLANS[planId as PlanId];
        const priceId = annual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;

        if (!priceId) {
            return NextResponse.json({ error: "Price not found" }, { status: 400 });
        }

        // Determine base URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
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
                trial_period_days: 7,
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
