const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function createTables() {
    // Create user_subscriptions table
    const { error: e1 } = await supabase.from("user_subscriptions").select("id").limit(1);

    if (e1 && e1.code === "PGRST205") {
        console.log("user_subscriptions table does not exist. Creating via REST API...");

        // Use the Supabase Management API or SQL directly
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/exec_sql";

        // Since we can't run raw SQL via client, let's try inserting to see if table exists
        // We need to create tables via Supabase Dashboard SQL Editor
        console.log("\n⚠️ Tables need to be created manually in Supabase SQL Editor!");
        console.log("Go to: https://supabase.com/dashboard → Your Project → SQL Editor");
        console.log("Then paste this SQL:\n");

        const sql = `
-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'hobby',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly match usage tracking
CREATE TABLE IF NOT EXISTS public.match_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,
    match_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_match_usage_user_month ON public.match_usage(user_id, month);
`;
        console.log(sql);
    } else {
        console.log("✅ user_subscriptions table exists!");

        // Check for data
        const { data } = await supabase.from("user_subscriptions").select("*");
        console.log("Current subscriptions:", JSON.stringify(data, null, 2));
    }
}

createTables().catch(console.error);
