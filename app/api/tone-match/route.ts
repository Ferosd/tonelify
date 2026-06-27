import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { redis } from "@/lib/redis";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { canUserMatch, incrementMatchUsage } from "@/lib/subscription";


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check match limit
        const { allowed, subscription } = await canUserMatch(userId);
        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Match limit reached",
                    subscription,
                    message: `You've used all ${subscription.matchLimit} matches this month. Upgrade your plan for more.`,
                },
                { status: 403 }
            );
        }

        const { songTitle, artist, userGear } = await req.json();

        if (!songTitle || !artist || !userGear) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 0. Check Cache
        // Create a unique key based on inputs. Normalize strings to lowercase/trimmed.
        const cacheKey = `tone-match:v2:${JSON.stringify({
            song: songTitle.toLowerCase().trim(),
            artist: artist.toLowerCase().trim(),
            gear: userGear
        })}`;

        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            // console.log("Serving from cache:", cacheKey)
            return NextResponse.json(cachedResult);
        }

        // 1. Fetch Song Data (Target Gear) from Supabase
        // We try to find if we have specific gear data for this song.
        let songGearData = null;

        const { data: songs, error: songError } = await getSupabaseAdmin()
            .from("songs")
            .select("id, title, artist, song_gear(*)")
            .ilike("title", songTitle)
            .ilike("artist", artist)
            .maybeSingle();

        if (songError) {
            console.error("Supabase Error:", songError);
        }

        // If not exact match, maybe try fuzzy search or just rely on AI's knowledge
        // For now, if we found it in our seed data, great!
        if (songs && songs.song_gear && songs.song_gear.length > 0) {
            songGearData = songs.song_gear[0];
        }

        // 2. Construct the Prompt
        // If we have verified gear data, we include it. If not, we ask AI to use its knowledge.

        let prompt = `Act as a professional guitar tech and sound engineer.
    
    Target Tone:
    Song: "${songTitle}" by "${artist}"
    `;

        if (songGearData) {
            prompt += `
      Verified Original Gear Used:
      - Guitar: ${songGearData.guitar_model} (Pickups: ${songGearData.pickup_type})
      - Amp: ${songGearData.amp_model}
      - Effects: ${songGearData.effects.join(", ")}
      `;
        } else {
            prompt += `
      (Note: No specific gear data found in database. Use your general knowledge of this song/artist to determine the target tone characteristics.)
      `;
        }

        prompt += `
    User's Available Equipment:
    - Guitar: ${userGear.guitarModel} (Pickups: ${userGear.pickupType})
    - Amp: ${userGear.ampModel}${userGear.goingDirect ? " (Going direct / no physical amp)" : ""}
    - Effects: ${userGear.effects ? userGear.effects.join(", ") : "None/Unknown"}

    Task:
    Provide the exact settings to replicate the "${songTitle}" tone using the USER'S equipment.
    Do NOT suggest buying new gear unless absolutely necessary (emphasize tweaking current gear).
    Also document the ORIGINAL artist's rig and settings (use the verified gear above if provided, otherwise your best knowledge), classify the tone, list any effects the original used that the user's gear lacks (with practical alternatives), and give concrete playing tips.

    Response Format (JSON only):
    {
      "explanation": "Brief explanation of how to approach this tone with user's gear.",
      "tags": {
        "genre": "Primary genre (e.g. Hard Rock)",
        "era": "Decade/era (e.g. 1990s)",
        "tempo": "Slow | Medium | Fast",
        "part": "Riff | Solo"
      },
      "original": {
        "guitar": "Original guitar used by the artist",
        "amp": "Original amp(s) used",
        "pickups": "Original pickup type/position",
        "ampSettings": {
          "gain": "0-10", "bass": "0-10", "middle": "0-10",
          "treble": "0-10", "presence": "0-10", "reverb": "0-10"
        },
        "signalChain": ["Ordered signal chain, e.g. 'Guitar (neck pickup)'", "'Digital Delay (Roland SRV-2000)'", "'Marshall Silver Jubilee head'"]
      },
      "suggestedSettings": {
        "guitar": {
          "pickupSelector": "Position (1-5 or description)",
          "volume": "0-10",
          "tone": "0-10"
        },
        "amp": {
          "gain": "0-10",
          "bass": "0-10",
          "middle": "0-10",
          "treble": "0-10",
          "reverb": "0-10",
          "presence": "0-10 (if applicable)"
        },
        "pedals": [
          {
            "name": "Pedal Name (from user gear or suggested generic)",
            "settings": "Knob positions (e.g. Level: 5, Drive: 3)"
          }
        ]
      },
      "missingEffects": [
        {
          "name": "Effect the original used but the user lacks (e.g. Digital Delay rack)",
          "reason": "Why it matters to the tone",
          "alternatives": ["Practical way to approximate it with the user's current gear"]
        }
      ],
      "playingTips": [
        "Actionable technique/playing tip 1",
        "Tip 2",
        "Tip 3"
      ],
      "confidenceScore": 0-100
    }
    `;

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Or gpt-3.5-turbo if cost is a concern
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI guitar tech assistant. Output valid JSON only.",
                },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

        // 3b. If we have verified gear data from our DB, trust it over the AI's guess
        if (songGearData) {
            aiResponse.original = {
                ...(aiResponse.original || {}),
                guitar: songGearData.guitar_model ?? aiResponse.original?.guitar,
                amp: songGearData.amp_model ?? aiResponse.original?.amp,
                pickups: songGearData.pickup_type ?? aiResponse.original?.pickups,
                effects: songGearData.effects ?? aiResponse.original?.effects,
                verified: true,
            };
        }

        // 4. Cache the result for 7 days
        await redis.set(cacheKey, aiResponse, { ex: 60 * 60 * 24 * 7 });

        // 5. Increment match usage
        await incrementMatchUsage(userId);

        return NextResponse.json(aiResponse);

    } catch (error) {
        console.error("Error in tone-match API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
