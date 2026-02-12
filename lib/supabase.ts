import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Public client (anon key)
export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
        )
    }
    return _supabase
}

// Admin client (service role key) - for API routes
export function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
            process.env.SUPABASE_SERVICE_KEY || "placeholder-key"
        )
    }
    return _supabaseAdmin
}

// Backward compatible export
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabase() as any)[prop]
    }
})
