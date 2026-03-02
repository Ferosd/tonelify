import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
    if (!_redis) {
        _redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL || '',
            token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
        })
    }
    return _redis
}

// Lazy proxy to avoid build-time crash when env vars are missing
export const redis = new Proxy({} as Redis, {
    get(_target, prop) {
        return (getRedis() as any)[prop]
    },
})
