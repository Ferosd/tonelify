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

        const { songTitle, artist, userGear, partType, toneType, instrument } = await req.json();

        if (!songTitle || !artist || !userGear) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 0. Check Cache
        // Create a unique key based on inputs. Normalize strings to lowercase/trimmed.
        const cacheKey = `tone-match:${JSON.stringify({
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
    - Amp: ${userGear.ampModel}
    - Effects: ${userGear.effects ? userGear.effects.join(", ") : "None/Unknown"}
    
    Part Type: ${partType || "riff"} (${partType === "solo" ? "Lead/Solo part" : "Rhythm/Riff part"})
    Tone Type: ${toneType || "auto"} (${toneType === "clean" ? "Clean tone" : toneType === "distorted" ? "Distorted/overdriven tone" : "Auto-detect from song"})
    Instrument: ${instrument || "guitar"}
    
    Task:
    Provide the exact settings to replicate the "${songTitle}" tone using the USER'S equipment.
    Focus specifically on the ${partType === "solo" ? "lead/solo" : "rhythm/riff"} part of the song.
    ${toneType === "clean" ? "The user wants a CLEAN tone adaptation." : toneType === "distorted" ? "The user wants a DISTORTED/overdriven tone adaptation." : "Auto-detect the appropriate tone type from the song."}
    Do NOT suggest buying new gear unless absolutely necessary (emphasize tweaking current gear).

    Critically important: You MUST provide BOTH original_tone and adapted_tone in your response.
    
    original_tone: Research and provide the ACTUAL gear the artist used for this song. Include specific guitar model, amp model, pickup type, the amp settings they likely used, and any effects pedals they actually used.
    
    adapted_tone: Based on the user's gear, provide ADJUSTED settings. For each setting that differs from original, explain WHY in the adjustments object. Consider pickup output differences, amp type differences, wood/hardware differences.
    
    gear_differences: List 2-4 key differences between original and user gear that required adjustment.
    
    Response Format (JSON only):
    {
      "explanation": "Brief explanation of how to approach this tone with user's gear.",
      "original_tone": {
        "guitar": "Specific guitar model the artist used",
        "amp": "Specific amp model the artist used",
        "pickups": "Pickup type (humbucker, single coil, P90, etc.)",
        "settings": {
          "gain": 0-10,
          "bass": 0-10,
          "mid": 0-10,
          "treble": 0-10,
          "master": 0-10,
          "presence": 0-10
        },
        "effects": [
          {
            "name": "Effect/Pedal Name",
            "settings": "Knob positions"
          }
        ]
      },
      "adapted_tone": {
        "settings": {
          "gain": 0-10,
          "bass": 0-10,
          "mid": 0-10,
          "treble": 0-10,
          "master": 0-10,
          "presence": 0-10
        },
        "adjustments": {
          "gain": "+/-N reason for adjustment",
          "bass": "+/-N reason for adjustment",
          "mid": "+/-N reason for adjustment",
          "treble": "+/-N reason for adjustment",
          "master": "+/-N reason for adjustment"
        }
      },
      "gear_differences": ["Key difference 1", "Key difference 2", "Key difference 3"],
      "suggestedSettings": {
        "guitar": {
          "pickupSelector": "Position (1-5 or description)",
          "volume": "0-10",
          "tone": "0-10"
        },
        "amp": {
          "gain": "0-10",
          "bass": "0-10",
          "mid": "0-10",
          "treble": "0-10",
          "reverb": "0-10",
          "presence": "0-10 (if applicable)",
          "master": "0-10"
        },
        "pedals": [
          {
            "name": "Pedal Name (from user gear or suggested generic)",
            "settings": "Knob positions (e.g. Level: 5, Drive: 3)"
          }
        ]
      },
      "playingTips": ["Specific playing technique tip 1", "Specific playing technique tip 2", "Specific playing technique tip 3"],
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
