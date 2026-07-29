import { redis } from "@/lib/redis";

/**
 * Fixed-window per-caller rate limit, backed by the same Redis the cache uses.
 *
 * Fails open: `redis` already turns `incr`/`expire` outages into nulls, and a
 * counter we can't read shouldn't take the endpoint down with it. The window is
 * a plain counter rather than a sliding log because these limits exist to stop
 * scripted flooding, not to meter usage precisely.
 */
export async function checkRateLimit(
    scope: string,
    identifier: string,
    limit: number,
    windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
    const key = `rl:${scope}:${identifier}`;

    const count = await redis.incr(key);
    if (count === null) {
        // Redis is unreachable — let the caller through.
        return { allowed: true, retryAfter: 0 };
    }
    if (count === 1) {
        await redis.expire(key, windowSeconds);
    }

    return { allowed: count <= limit, retryAfter: windowSeconds };
}

/**
 * Best-effort caller identity for anonymous endpoints. Behind Vercel the first
 * x-forwarded-for entry is the client; the literal "anon" bucket is a shared
 * fallback, which is deliberately strict rather than unlimited.
 */
export function callerIp(req: Request): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")?.trim()
        || "anon";
}
