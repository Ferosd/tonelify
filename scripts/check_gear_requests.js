const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkTable() {
    console.log("Checking gear_requests table...");

    const { error } = await supabase.from("gear_requests").select("id").limit(1);

    if (error && error.code === "PGRST205") {
        console.log("❌ gear_requests table does not exist!");
        console.log("\nPlease run this SQL in Supabase Dashboard:");
        console.log(`
CREATE TABLE IF NOT EXISTS public.gear_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  equipment_type TEXT NOT NULL,
  equipment_name TEXT,
  additional_info TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.gear_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create requests" ON public.gear_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own requests" ON public.gear_requests FOR SELECT USING (auth.uid()::text = user_id);
`);
    } else {
        console.log("✅ gear_requests table exists!");
    }
}

checkTable().catch(console.error);
