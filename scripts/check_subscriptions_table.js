const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkTable() {
    console.log("Checking user_subscriptions table...");

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .limit(1);

    if (error) {
        console.log("❌ Error or table missing:", error.message);
        if (error.code === 'PGRST205') { // Relation missing
            console.log("Table definitely missing.");
        }
    } else {
        console.log("✅ Table 'user_subscriptions' exists.");
        console.log("Sample data:", data);
    }
}

checkTable();
