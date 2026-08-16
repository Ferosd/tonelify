import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { redis } from "@/lib/redis";
import { getSupabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { canUserMatch, incrementMatchUsage } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rate-limit";
import { curatedSource, sanitizeModelSources } from "@/lib/sources";
import { findGear, gearPromptFacts } from "@/lib/gear-catalog";

// One gpt-4o call takes 10-25s under load. The platform default cuts the
// function off before that on a slow day, which the browser sees as a failed
// fetch with no message at all.
export const maxDuration = 60;

// Plan quotas meter a month; this meters a minute. Unlimited plans have no
// monthly ceiling at all, so without it one account (or one stuck retry loop)
// can run up the OpenAI bill unchecked.
const MATCHES_PER_MINUTE = 8;

// Leaves ~10s of the function budget for Supabase writes and the response.
const OPENAI_TIMEOUT_MS = 45_000;

// Input validation: length caps keep prompt size (and OpenAI cost) bounded
const requestSchema = z.object({
    songTitle: z.string().trim().min(1).max(200),
    artist: z.string().trim().min(1).max(120),
    instrument: z.string().max(20).optional(),
    partType: z.string().max(20).optional(),
    toneType: z.string().max(20).optional(),
    userGear: z.object({
        guitarModel: z.string().trim().min(1).max(120),
        pickupType: z.string().trim().max(80).optional().default(""),
        ampModel: z.string().trim().max(120).optional().default(""),
        goingDirect: z.boolean().optional().default(false),
        effects: z.array(z.string().trim().max(80)).max(20).optional().default([]),
        effectsType: z.string().max(20).optional(),
        multiFxUnit: z.string().trim().max(120).optional().default(""),
    }),
});


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const burst = await checkRateLimit("tone-match", userId, MATCHES_PER_MINUTE, 60);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too fast", message: "That's a lot of matches at once. Give it a minute and try again." },
                { status: 429, headers: { "Retry-After": String(burst.retryAfter) } }
            );
        }

        // Check match limit. An account with no plan and an account that has
        // spent a metered plan are both blocked here, but they are not the same
        // situation and must not read the same: `locked` lets the client send
        // one to /plans to subscribe and the other to /plans to move up.
        const { allowed, subscription, reason } = await canUserMatch(userId);
        if (!allowed) {
            const noPlan = reason === "no-plan";
            return NextResponse.json(
                {
                    error: noPlan ? "Subscription required" : "Match limit reached",
                    locked: noPlan ? "no-plan" : "quota",
                    subscription,
                    message: noPlan
                        ? "Tone matching is part of a Tonelify plan. Pick one to start matching, and cancel whenever you like."
                        : `You've used all ${subscription.matchLimit} matches this month. Move up a plan for more.`,
                },
                { status: 403 }
            );
        }

        const parsed = requestSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Missing or invalid fields", details: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) },
                { status: 400 }
            );
        }
        const { songTitle, artist, userGear, instrument, partType, toneType } = parsed.data;

        // Normalize playing-context selections (sent from the tone-match UI)
        const playInstrument = instrument === "bass" ? "bass" : "guitar";
        const playPart = partType === "solo" ? "solo" : "riff";
        const playTone = toneType === "clean" ? "clean" : toneType === "distorted" ? "distorted" : "auto";

        // 0. Check Cache
        // Create a unique key based on inputs. Normalize strings to lowercase/trimmed.
        // Selections are part of the key so different choices don't collide on one result.
        const cachePayload = JSON.stringify({
            song: songTitle.toLowerCase().trim(),
            artist: artist.toLowerCase().trim(),
            gear: userGear,
            instrument: playInstrument,
            part: playPart,
            tone: playTone
        });
        // Hash keeps Redis keys bounded regardless of input length.
        // v5: the payload gained `sources` and `provenance`, and a v4 entry
        // would replay without them for a week.
        const requestHash = createHash("sha256").update(cachePayload).digest("hex");
        const cacheKey = `tone-match:v5:${requestHash}`;

        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            // A cache hit used to return before the usage counter, so a metered
            // plan could replay the same query forever without spending a
            // match. What the caller gets is a finished tone card either way,
            // so a served result costs a match — but only the first time this
            // user asks for this exact request. Re-running an identical query
            // returns the identical card, and charging twice for the same
            // answer is what would actually read as broken.
            const chargeKey = `tone-match:charged:${userId}:${requestHash}`;
            const firstTime = await redis.set(chargeKey, 1, { ex: 60 * 60 * 24 * 31, nx: true });
            if (firstTime) await incrementMatchUsage(userId);

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

    Playing Context (honor these in your settings and tips):
    - Instrument: ${playInstrument === "bass" ? "Bass guitar" : "Electric guitar"}
    - Part: ${playPart === "solo" ? "Lead / Solo (favor presence, sustain and cut)" : "Rhythm / Riff (favor tightness and note definition)"}
    - Desired tone: ${playTone === "clean" ? "Clean (minimal gain/breakup)" : playTone === "distorted" ? "Distorted (driven / high gain as the song needs)" : "Auto — match the original recording's character"}
    `;

        // A curated row's effects list can be empty, which means "we have not
        // recorded any", not "the recording used none". Those are different
        // claims and only the first one is true of the seeded rows, so an empty
        // array is never presented to the model or the reader as a fact.
        const curatedEffects: string[] = Array.isArray(songGearData?.effects)
            ? songGearData.effects.filter((e: unknown) => typeof e === "string" && e.trim())
            : [];

        if (songGearData) {
            prompt += `
      Verified Original Gear Used:
      - Guitar: ${songGearData.guitar_model} (Pickups: ${songGearData.pickup_type})
      - Amp: ${songGearData.amp_model}
      - Effects: ${curatedEffects.length > 0
                    ? curatedEffects.join(", ")
                    : "not recorded in our database, use your own knowledge for this line only"}
      `;
        } else {
            prompt += `
      (Note: No specific gear data found in database. Use your general knowledge of this song/artist to determine the target tone characteristics.)
      `;
        }

        const usesMultiFx = userGear.effectsType === "multi" && !!userGear.multiFxUnit;

        prompt += `
    User's Available Equipment:
    - Guitar: ${userGear.guitarModel} (Pickups: ${userGear.pickupType})
    - Amp: ${userGear.ampModel}${userGear.goingDirect ? " (Going direct / no physical amp)" : ""}
    - ${usesMultiFx ? `Multi FX unit: ${userGear.multiFxUnit}` : "Effects"}: ${userGear.effects && userGear.effects.length > 0 ? userGear.effects.join(", ") : usesMultiFx ? "No specific blocks named — pick suitable ones from that unit" : "None/Unknown"}
`;

        // Known gear facts, looked up server-side rather than trusted from the
        // request body. The panel list is the point: the most damaging failure
        // this product has is telling somebody to set a presence knob on an amp
        // that does not have one, because the player is looking straight at the
        // amp and can see we are wrong.
        const gearFacts = [
            findGear(userGear.guitarModel, playInstrument === "bass" ? ["bass", "guitar"] : ["guitar", "bass"]),
            userGear.ampModel ? findGear(userGear.ampModel, ["amp", "bass-amp"]) : undefined,
            usesMultiFx && userGear.multiFxUnit ? findGear(userGear.multiFxUnit, ["multifx"]) : undefined,
        ]
            .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
            .map(gearPromptFacts)
            .filter(Boolean);

        if (gearFacts.length > 0) {
            prompt += `
    Known specifications for the user's gear (these are correct, prefer them over your own recollection):
    ${gearFacts.map((f) => `- ${f}`).join("\n    ")}

    Where a control list is given it is exhaustive. Do not return a value for a
    control that is not on that list; omit the field or set it to null instead.
    If the original tone needs something the user's amp has no control for, say
    so in missingEffects or playingTips rather than inventing the knob.
`;
        }

        if (usesMultiFx) {
            prompt += `
    IMPORTANT — the user is running a "${userGear.multiFxUnit}" multi FX processor, not individual pedals.
    Name the actual amp/cab models and effect blocks as they appear in THAT unit's menus, and give
    the block parameters by their real on-unit names. In the "pedals" array, return one entry per
    block in signal-chain order (name = the unit's block name, settings = its parameter values).
    Do not tell them to buy standalone pedals they don't need.
`;
        }

        prompt += `
    Task:
    Provide the exact settings to replicate the "${songTitle}" tone using the USER'S equipment.
    Do NOT suggest buying new gear unless absolutely necessary (emphasize tweaking current gear).
    Also document the ORIGINAL artist's rig and settings (use the verified gear above if provided, otherwise your best knowledge), classify the tone, list any effects the original used that the user's gear lacks (with practical alternatives), and give concrete playing tips.

    Sources: name where the ORIGINAL rig information comes from, up to 4 entries, most
    specific first. Give the publication or programme and what it established.
    Do NOT output URLs; they are ignored. If you are working from general knowledge
    rather than a specific documented source, say so with kind "model-knowledge"
    instead of naming a publication you are not sure about. An honest
    "model-knowledge" entry is better than a confident wrong citation.

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
          "mode": "Amp voicing/mode ONLY if the user's amp has selectable voicings (e.g. 'Brown' on a Boss Katana, 'Modern' on a Mesa). Omit or null otherwise.",
          "channel": "Amp channel ONLY if the user's amp has multiple channels (e.g. 'Dirty', 'Lead', 'OD2'). Omit or null otherwise.",
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
      "sources": [
        {
          "title": "Publication or programme, e.g. 'Premier Guitar Rig Rundown' or 'Guitar World interview, 1991'",
          "kind": "rig-rundown | interview | manufacturer | forum | documentary | album-credits | model-knowledge",
          "detail": "One short sentence on what this source establishes about the rig"
        }
      ],
      "confidenceScore": 0-100
    }
    `;

        // 3. Call OpenAI
        let completion;
        try {
            completion = await openai.chat.completions.create(
                {
                    model: "gpt-4o", // Or gpt-3.5-turbo if cost is a concern
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful AI guitar tech assistant. Output valid JSON only.",
                        },
                        { role: "user", content: prompt },
                    ],
                    response_format: { type: "json_object" },
                },
                { timeout: OPENAI_TIMEOUT_MS, maxRetries: 1 }
            );
        } catch (aiError: any) {
            // A model outage used to surface as a bare 500 "Internal Server
            // Error", which reads as the site being broken rather than one
            // slow dependency. Say what happened and that a retry is free.
            console.error("OpenAI error:", aiError?.message || aiError);
            return NextResponse.json(
                {
                    error: "Tone engine unavailable",
                    message: "The tone engine took too long to answer. Nothing was counted against your matches, so hit Run Research again.",
                },
                { status: 503 }
            );
        }

        let aiResponse: any;
        try {
            aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
        } catch {
            aiResponse = {};
        }

        // An empty or shapeless answer would render as a card full of blanks and
        // still burn a match. Treat it as a failed call instead.
        if (!aiResponse?.suggestedSettings?.amp && !aiResponse?.suggestedSettings?.guitar) {
            console.error("OpenAI returned an unusable tone payload for", songTitle, artist);
            return NextResponse.json(
                {
                    error: "Tone engine unavailable",
                    message: "The tone engine returned an incomplete answer. Nothing was counted, please try again.",
                },
                { status: 502 }
            );
        }

        // 3b. Provenance.
        //
        // The model is allowed to name where it got the rig from, but it is not
        // allowed to produce a link: an invented URL that 404s costs more trust
        // than showing no link at all. sanitizeModelSources drops any url field
        // and types the rest. Curated rows are the only path to a real href,
        // because a person opened that page before it was stored.
        aiResponse.sources = sanitizeModelSources(aiResponse.sources);
        aiResponse.provenance = "model";

        // If we have verified gear data from our DB, trust it over the AI's guess
        if (songGearData) {
            aiResponse.original = {
                ...(aiResponse.original || {}),
                guitar: songGearData.guitar_model ?? aiResponse.original?.guitar,
                amp: songGearData.amp_model ?? aiResponse.original?.amp,
                pickups: songGearData.pickup_type ?? aiResponse.original?.pickups,
                // Only a populated curated list overrides. `?? ` let an empty
                // array through, which blanked the effects line on every row
                // whose pedals were never entered.
                effects: curatedEffects.length > 0 ? curatedEffects : aiResponse.original?.effects,
                verified: true,
            };
            aiResponse.provenance = "verified";

            // scripts/sql/add_source_columns.sql may not have been run yet, so
            // these are read defensively; a verified row with no stored source
            // still shows the badge, just without the citation.
            const curated = curatedSource(
                songGearData.source_title,
                songGearData.source_url,
                songGearData.source_detail
            );
            if (curated) {
                aiResponse.sources = [curated, ...aiResponse.sources].slice(0, 4);
            }
        }

        // 4. Cache the result for 7 days
        await redis.set(cacheKey, aiResponse, { ex: 60 * 60 * 24 * 7 });

        // 5. Increment match usage, and record that this user has now paid for
        // this exact request so the cache-hit path above doesn't charge them a
        // second time when they run it again.
        await redis.set(`tone-match:charged:${userId}:${requestHash}`, 1, { ex: 60 * 60 * 24 * 31 });
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
