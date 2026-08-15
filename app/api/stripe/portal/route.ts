import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { findCustomerIds, findLiveSubscription } from "@/lib/stripe-customer";
import { SITE_URL } from "@/lib/site";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clerkUser = await currentUser();
        const email = clerkUser?.primaryEmailAddress?.emailAddress
            ?? clerkUser?.emailAddresses?.[0]?.emailAddress
            ?? null;

        // Resolved the same way checkout resolves it, so someone whose billing
        // sits on an older customer record still reaches their own portal
        // instead of a "no billing record" dead end.
        const customerIds = await findCustomerIds(userId, email);

        if (customerIds.length === 0) {
            return NextResponse.json(
                { error: "We can't find a billing record for this account. If you've just paid, give it a minute, otherwise email contact@tonelify.com." },
                { status: 404 }
            );
        }

        // Prefer the record holding the live subscription: that is the one whose
        // portal can actually cancel or switch the plan.
        const live = await findLiveSubscription(customerIds);
        const customerId = live?.customerId ?? customerIds[0];

        // SITE_URL strips the trailing slash the production value carries, which
        // otherwise sent customers back to "https://tonelify.com//settings"
        const baseUrl = SITE_URL || req.headers.get("origin") || "http://localhost:3000";
        const returnUrl = `${baseUrl}/settings`;

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
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
