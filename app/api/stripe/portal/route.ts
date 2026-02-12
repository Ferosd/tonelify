import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user subscription to find customer ID
        const { data: sub } = await getSupabaseAdmin()
            .from("user_subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", userId)
            .single();

        if (!sub?.stripe_customer_id) {
            return NextResponse.json({ error: "No subscription found" }, { status: 404 });
        }

        // Determine return URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";
        const returnUrl = `${baseUrl}/settings`;

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Billing Portal error:", error);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}
