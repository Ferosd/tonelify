import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server"; // Ensure NextRequest is imported

export async function GET() {
    try {
        const { data: reviews, error } = await supabase
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

        const { rating, comment, name } = await req.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                user_id: userId,
                name: name || "Anonymous",
                rating,
                comment,
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
