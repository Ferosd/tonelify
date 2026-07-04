import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const RATE_LIMIT_PER_MINUTE = 30;
const RESULT_CACHE_SECONDS = 60 * 60 * 24; // iTunes metadata changes rarely

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().slice(0, 100);

    if (!query) {
        return NextResponse.json([]);
    }

    // Per-IP rate limit (fail open if Redis is unavailable)
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
        const rlKey = `rl:search-song:${ip}`;
        const count = await redis.incr(rlKey);
        if (count === 1) await redis.expire(rlKey, 60);
        if (count > RATE_LIMIT_PER_MINUTE) {
            return NextResponse.json(
                { error: "Too many searches. Try again in a minute." },
                { status: 429 }
            );
        }
    } catch {
        // Redis down — allow the request rather than break search
    }

    const cacheKey = `search-song:${query.toLowerCase()}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }
    } catch {
        // Cache miss path below still works without Redis
    }

    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`
        );
        const data = await response.json();

        const results = (data.results || []).map((item: any) => ({
            trackName: item.trackName,
            artistName: item.artistName,
            albumName: item.collectionName,
            artworkUrl: item.artworkUrl60,
        }));

        try {
            await redis.set(cacheKey, results, { ex: RESULT_CACHE_SECONDS });
        } catch {
            // Non-fatal
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("iTunes Search Error:", error);
        return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
    }
}
