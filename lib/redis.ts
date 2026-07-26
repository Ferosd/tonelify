import { Redis } from '@upstash/redis'

const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Commands a caller can survive losing. A failed read is a cache miss, a failed
// write just means the next request recomputes, and a failed rate-limit counter
// lets the request through. Anything not listed here still throws, so a real
// misuse doesn't get swallowed along with the outage.
const OPTIONAL = new Set(['get', 'set', 'del', 'incr', 'expire'])

let lastLoggedAt = 0

function report(command: string, error: unknown) {
    // One line a minute. Enough to spot an outage in the logs, not enough to
    // bury every other error under it once a whole deployment starts failing.
    const now = Date.now()
    if (now - lastLoggedAt < 60_000) return
    lastLoggedAt = now
    console.error(`[redis] ${command} failed, continuing without cache:`, error)
}

/**
 * The cache disappeared once and took tone matching down with it: the route
 * reads the cache before it calls OpenAI, so an unreachable host turned every
 * match into a 500 while OpenAI, Supabase and the model were all fine. Losing
 * Redis should cost latency and repeated API spend, not the feature itself.
 */
export const redis = new Proxy(client, {
    get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver)
        if (typeof prop !== 'string' || typeof value !== 'function' || !OPTIONAL.has(prop)) {
            return value
        }
        return (...args: unknown[]) =>
            (value as (...a: unknown[]) => Promise<unknown>)
                .apply(target, args)
                .catch((error: unknown) => {
                    report(prop, error)
                    // Reads become a miss; writes and counters become a no-op.
                    return null
                })
    },
})
