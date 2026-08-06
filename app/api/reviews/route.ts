import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Signing in is cheap, so the review form needs its own ceiling per account.
const REVIEWS_PER_DAY = 3;


export async function GET() {
    try {
        const { data: reviews, error } = await getSupabaseAdmin()
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { allowed } = await checkRateLimit("reviews", userId, REVIEWS_PER_DAY, 60 * 60 * 24);
        if (!allowed) {
            return NextResponse.json(
                { error: "You've posted enough reviews for today." },
                { status: 429 }
            );
        }

        const { rating, comment, name } = await req.json();

        // The rating drives `Array.from({ length: review.rating })` on the
        // reviews list, so an out-of-range number posted straight at this
        // endpoint would try to render that many stars for every visitor.
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
        }
        if (typeof comment !== "string" || !comment.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (name !== undefined && name !== null && typeof name !== "string") {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }

        const { data, error } = await getSupabaseAdmin()
            .from("reviews")
            .insert({
                user_id: userId,
                name: (typeof name === "string" && name.trim().slice(0, 60)) || "Anonymous",
                rating,
                comment: comment.trim().slice(0, 1000),
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Error posting review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
