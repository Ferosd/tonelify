import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { songTitle, artist, userGear, settings } = await req.json();

        if (!settings) {
            return NextResponse.json({ error: "Missing settings data" }, { status: 400 });
        }

        // 1. Ensure User Profile Exists
        // Since we use Clerk, we need to sync user to our profiles table if not exists
        const { data: profile, error: profileError } = await getSupabaseAdmin()
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();

        if (!profile) {
            // Create profile
            const { error: createProfileError } = await getSupabaseAdmin()
                .from("profiles")
                .insert({
                    id: userId,
                    email: user.emailAddresses[0]?.emailAddress,
                    full_name: `${user.firstName} ${user.lastName}`.trim(),
                });

            if (createProfileError) {
                console.error("Error creating profile:", createProfileError);
                // Continue anyway, maybe FK will fail or maybe it worked despite error
            }
        }

        // 2. Ideally we should link to 'songs' table, but for now we might just want to save the raw data
        // If 'song_id' is required, we need to find or create the song.
        // Let's check if song exists
        let songId = null;
        const { data: songData } = await getSupabaseAdmin()
            .from("songs")
            .select("id")
            .ilike("title", songTitle)
            .ilike("artist", artist)
            .maybeSingle();

        if (songData) {
            songId = songData.id;
        } else {
            // Create new song entry
            const { data: newSong, error: newSongError } = await getSupabaseAdmin()
                .from("songs")
                .insert({
                    title: songTitle,
                    artist: artist,
                    genre: "Unknown", // Placeholder
                    year: new Date().getFullYear() // Placeholder
                })
                .select()
                .single();

            if (newSong) songId = newSong.id;
        }

        // 3. Save the Tone Match
        const { data, error } = await getSupabaseAdmin()
            .from("tone_matches")
            .insert({
                user_id: userId,
                song_id: songId, // Can be null if FK allows, but our schema allows null? Let's check schema.
                // Actually schema says: song_id UUID REFERENCES public.songs(id)
                // It doesn't say NOT NULL, so it can be null. But better to valid song.
                settings: settings,
                // We are storing the whole settings JSON.
                // We could also store user_equipment_id if we managed that table, but for now we skip it.
            })
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
