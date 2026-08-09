import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";
import { canUserSaveTone } from "@/lib/subscription";
import { ensureProfile } from "@/lib/profile";


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { songTitle, artist, userGear, settings } = await req.json();

        if (!settings || typeof settings !== "object") {
            return NextResponse.json({ error: "Missing settings data" }, { status: 400 });
        }
        // `settings` is stored as-is, so nothing stopped a caller posting a
        // multi-megabyte blob straight into the table. A real match payload is
        // a few kilobytes.
        if (JSON.stringify(settings).length > 100_000) {
            return NextResponse.json({ error: "Settings payload is too large" }, { status: 413 });
        }
        if (!songTitle || typeof songTitle !== "string" || !songTitle.trim()) {
            return NextResponse.json({ error: "Missing song title" }, { status: 400 });
        }
        if (songTitle.length > 200 || (artist && (typeof artist !== "string" || artist.length > 120))) {
            return NextResponse.json({ error: "Invalid song or artist" }, { status: 400 });
        }

        // An absent artist used to reach PostgREST as the literal string
        // "undefined" in the ilike filter, so the lookup never matched and a
        // duplicate song row was written each time.
        const artistName = typeof artist === "string" && artist.trim() ? artist.trim() : "Unknown artist";
        const title = songTitle.trim();

        // 1. Ensure User Profile Exists
        // tone_matches.user_id references profiles(id), and Clerk doesn't
        // populate that table for us.
        if (!await ensureProfile(userId)) {
            return NextResponse.json({ error: "Could not set up your account" }, { status: 500 });
        }

        // 2. Link the match to a row in `songs`, creating one if this is the
        // first time anybody saved this track. genre/year stay null rather than
        // getting placeholder values — "Unknown / 2026" was showing up as real
        // metadata in the library.
        let songId = null;
        const { data: songData } = await getSupabaseAdmin()
            .from("songs")
            .select("id")
            .ilike("title", title)
            .ilike("artist", artistName)
            .maybeSingle();

        if (songData) {
            songId = songData.id;
        } else {
            const { data: newSong } = await getSupabaseAdmin()
                .from("songs")
                .insert({ title, artist: artistName })
                .select()
                .single();

            if (newSong) songId = newSong.id;
        }

        // 3. Save the Tone Match.
        // One row per song per user: re-saving the same track overwrites its
        // settings instead of stacking another copy. Collections were filling
        // up with the same song three times over from repeated taps on Save.
        const { data: existingMatch } = songId
            ? await getSupabaseAdmin()
                .from("tone_matches")
                .select("id")
                .eq("user_id", userId)
                .eq("song_id", songId)
                .maybeSingle()
            : { data: null };

        // The plan's saved-tone limit only applies to new rows. Someone at their
        // limit can still re-save a track they already own — that adds nothing
        // to their collection.
        if (!existingMatch) {
            const { allowed, limit, used } = await canUserSaveTone(userId);
            if (!allowed) {
                return NextResponse.json(
                    {
                        error: "Saved tone limit reached",
                        limit,
                        used,
                        message: `You've saved ${used} of ${limit} tones on your plan. Upgrade to save more.`,
                    },
                    { status: 403 }
                );
            }
        }

        const { data, error } = existingMatch
            ? await getSupabaseAdmin()
                .from("tone_matches")
                .update({ settings, created_at: new Date().toISOString() })
                .eq("id", existingMatch.id)
                .select()
            : await getSupabaseAdmin()
                .from("tone_matches")
                .insert({ user_id: userId, song_id: songId, settings })
                .select();

        if (error) {
            console.error("Error saving tone match:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("Error in save-tone API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
