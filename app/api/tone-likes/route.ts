import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { checkRateLimit, callerIp } from "@/lib/rate-limit";
import { EMPTY_LIKES, songKey } from "@/lib/tone-likes";
import { getLikeState } from "@/lib/tone-likes-server";

// A like is one tap, and browsing the library while tapping is normal, so the
// ceiling is only here to stop a script writing thousands of rows.
const LIKES_PER_MINUTE = 30;
const READS_PER_MINUTE = 60;

const bodySchema = z.object({
    songTitle: z.string().trim().min(1).max(200),
    artist: z.string().trim().min(1).max(120),
    slug: z.string().trim().max(120).optional().default(""),
    // Absent means "flip whatever it is now". Sent explicitly by the button so
    // a double tap on a slow connection cannot land as an unintended unlike.
    liked: z.boolean().optional(),
});

/**
 * Toggles the caller's like on one recording.
 *
 * Sign-in is required for the same reason the feedback vote requires it: a
 * counter anyone can raise anonymously is not a number worth printing.
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const burst = await checkRateLimit("tone-likes", userId, LIKES_PER_MINUTE, 60);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too fast", message: "Give it a minute and try again." },
                { status: 429, headers: { "Retry-After": String(burst.retryAfter) } }
            );
        }

        const parsed = bodySchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }
        const { songTitle, artist, slug, liked } = parsed.data;

        // tone_likes.user_id is a foreign key onto profiles, so a user who has
        // never saved anything would otherwise fail the insert on 23503.
        await ensureProfile(userId);

        const key = songKey(songTitle, artist);

        // Resolve the target state on the server. The client sends what it
        // wants, but when it sends nothing we read the current row so the
        // toggle is still correct.
        let next = liked;
        if (next === undefined) {
            const { data: existing } = await getSupabaseAdmin()
                .from("tone_likes")
                .select("id")
                .eq("user_id", userId)
                .eq("song_key", key)
                .maybeSingle();
            next = !existing;
        }

        const { error } = next
            ? await getSupabaseAdmin()
                .from("tone_likes")
                .upsert(
                    {
                        user_id: userId,
                        song_key: key,
                        song_title: songTitle,
                        artist,
                        slug: slug || null,
                    },
                    // The unique index is what makes a second tap idempotent
                    // rather than a second row.
                    { onConflict: "user_id,song_key" }
                )
            : await getSupabaseAdmin()
                .from("tone_likes")
                .delete()
                .eq("user_id", userId)
                .eq("song_key", key);

        if (error) {
            console.error("tone_likes write failed:", error);
            return NextResponse.json(
                { error: "Could not record that", message: "That didn't save. Please try again." },
                { status: 500 }
            );
        }

        // Returned so the button can settle on the real number instead of
        // trusting its own optimistic guess.
        return NextResponse.json({ ok: true, likes: await getLikeState(songTitle, artist, userId) });
    } catch (error) {
        console.error("Error in tone-likes POST:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Read the count for one recording, plus whether the caller already liked it.
 *
 * Public, because the count is already printed on the public library pages.
 * The pages themselves are statically revalidated, so this is how the button
 * learns the signed-in visitor's own state after hydration.
 */
export async function GET(req: NextRequest) {
    try {
        const burst = await checkRateLimit("tone-likes-read", callerIp(req), READS_PER_MINUTE, 60);
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
            return NextResponse.json({ likes: EMPTY_LIKES });
        }

        const { userId } = await auth();
        return NextResponse.json({ likes: await getLikeState(songTitle, artist, userId) });
    } catch (error) {
        console.error("Error in tone-likes GET:", error);
        return NextResponse.json({ likes: EMPTY_LIKES });
    }
}
