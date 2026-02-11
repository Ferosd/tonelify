import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await getUserSubscription(userId);
        return NextResponse.json(subscription);
    } catch (error) {
        console.error("Subscription fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}
