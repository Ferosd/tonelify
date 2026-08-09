import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { checkRateLimit, callerIp } from "@/lib/rate-limit";
import { EMPTY_COUNTS, songKey } from "@/lib/tone-feedback";
import { getFeedbackCounts } from "@/lib/tone-feedback-server";

// Generous, because one honest user can legitimately vote on a handful of
// tones in a row. It only exists to stop a script writing thousands of rows.
const VOTES_PER_MINUTE = 20;
const READS_PER_MINUTE = 60;

const bodySchema = z.object({
    songTitle: z.string().trim().min(1).max(200),
    artist: z.string().trim().min(1).max(120),
    verdict: z.enum(["up", "down"]),
    guitarModel: z.string().trim().max(120).optional().default(""),
    ampModel: z.string().trim().max(120).optional().default(""),
});

/**
 * Records whether the settings actually worked on the player's rig.
 *
 * Sign-in is required for the same reason it is required to run a match: an
 * anonymous counter is a counter anyone can inflate, and the number is only
 * worth printing on the page if it means something.
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const burst = await checkRateLimit("tone-feedback", userId, VOTES_PER_MINUTE, 60);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too fast", message: "Give it a minute and try again." },
                { status: 429, headers: { "Retry-After": String(burst.retryAfter) } }
            );
        }

        const parsed = bodySchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Missing or invalid fields" },
                { status: 400 }
            );
        }
        const { songTitle, artist, verdict, guitarModel, ampModel } = parsed.data;

        // tone_feedback.user_id is a foreign key onto profiles, so a user who
        // has never saved a tone would otherwise fail the insert on 23503.
        await ensureProfile(userId);

        const key = songKey(songTitle, artist);

        // Upsert against the (user_id, song_key) unique index: changing your
        // mind edits your vote instead of adding a second one.
        const { error } = await getSupabaseAdmin()
            .from("tone_feedback")
            .upsert(
                {
                    user_id: userId,
                    song_key: key,
                    song_title: songTitle,
                    artist,
                    verdict,
                    guitar_model: guitarModel || null,
                    amp_model: ampModel || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,song_key" }
            );

        if (error) {
            console.error("tone_feedback upsert failed:", error);
            return NextResponse.json(
                { error: "Could not record that", message: "Your feedback didn't save. Please try again." },
                { status: 500 }
            );
        }

        // Returned so the card can show the updated count without a second trip
        const counts = await getFeedbackCounts(songTitle, artist);
        return NextResponse.json({ ok: true, counts });
    } catch (error) {
        console.error("Error in tone-feedback POST:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Public read of the counts for one recording. No auth: these numbers are
 * already printed on the public tone pages.
 */
export async function GET(req: NextRequest) {
    try {
        const burst = await checkRateLimit("tone-feedback-read", callerIp(req), READS_PER_MINUTE, 60);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too fast" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfter) } }
            );
        }

        const params = new URL(req.url).searchParams;
        const songTitle = (params.get("song") || "").trim().slice(0, 200);
        const artist = (params.get("artist") || "").trim().slice(0, 120);

        if (!songTitle || !artist) {
            return NextResponse.json({ counts: EMPTY_COUNTS });
        }

        return NextResponse.json({ counts: await getFeedbackCounts(songTitle, artist) });
    } catch (error) {
        console.error("Error in tone-feedback GET:", error);
        return NextResponse.json({ counts: EMPTY_COUNTS });
    }
}
