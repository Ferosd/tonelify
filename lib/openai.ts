import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }
    return _openai
}

// Lazy proxy to avoid build-time crash when env var is missing
export const openai = new Proxy({} as OpenAI, {
    get(_target, prop) {
        return (getOpenAI() as any)[prop]
    },
})
