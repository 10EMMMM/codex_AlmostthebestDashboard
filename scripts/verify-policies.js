const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPolicies() {
    try {
        console.log('Verifying Database State...');

        // 1. Check if the function exists
        // We can't easily check functions via Supabase JS client directly without RPC, 
        // but we can try to call it or check if policies reference it.
        // Actually, we can query pg_proc if we had direct SQL access, but we don't.
        // We will infer it from the policies.

        // 2. Check Policies on request_assignments
        // We can't query pg_policies via the JS client usually (unless exposed).
        // So we will try to perform a query that WOULD fail if recursion existed, 
        // but we need to do it as a "user" to trigger RLS.
        // Since we only have service role (admin), we can't easily simulate a user RLS failure here.

        // ALTERNATIVE: We can try to use the `rpc` method to run a raw SQL if a function exists, 
        // but we don't have a raw sql function.

        // Let's try to inspect the policies by querying the `pg_policies` table 
        // (Supabase often exposes this or we can try).
        // Note: standard Supabase API doesn't expose system tables.

        // So, the best way to verify is to try to fetch comments for the request 
        // BUT we need to simulate a non-admin user. 
        // Service role bypasses RLS, so it won't fail.

        console.log("Checking if we can fetch comments (Service Role - should always work)...");
        const { data: comments, error } = await supabase
            .from('request_comments')
            .select('id')
            .limit(1);

        if (error) {
            console.error("Service Role Fetch Error:", error);
        } else {
            console.log("Service Role Fetch Success (API is working).");
        }

        console.log("\nTo verify RLS, we need to check the policies manually.");
        console.log("Since I cannot query system tables directly via the client,");
        console.log("I will attempt to create a dummy user and check permissions if possible,");
        console.log("but that is risky.");

        console.log("\nInstead, I will output the SQL to check policies.");
        console.log("Please run this SQL in your Supabase SQL Editor to verify:");

        console.log(`
        SELECT tablename, policyname, cmd, qual 
        FROM pg_policies 
        WHERE tablename IN ('requests', 'request_assignments', 'request_comments');
        `);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyPolicies();
