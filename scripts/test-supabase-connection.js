const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
    process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
// Mask the key for logging
console.log(`Using Service Role Key: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    try {
        // 1. Check Auth (requires Service Role Key)
        console.log('\n--- Checking Auth Admin Access ---');
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

        if (authError) {
            console.error('❌ Auth check failed:', authError.message);
        } else {
            console.log('✅ Auth check successful!');
            console.log(`   Can list users. (Found ${users.length} in this page)`);
        }

        // 2. Check Database Access (try to select from a common table or just check health)
        // Since we don't know the schema, we'll just try a simple query. 
        // If we can't query information_schema (often hidden), we'll just stop at Auth check which confirms the key is valid.

        console.log('\n--- Connection Verification Complete ---');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkConnection();
