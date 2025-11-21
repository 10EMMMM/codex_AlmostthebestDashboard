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
        console.log('Attempting to query pg_policies...');

        // Try to query pg_policies directly using the service role
        // This usually fails unless the view is exposed to the API
        const { data, error } = await supabase
            .from('pg_policies')
            .select('tablename, policyname, cmd')
            .in('tablename', ['requests', 'request_assignments', 'request_comments']);

        if (error) {
            console.error('Error querying pg_policies:', error.message);
            console.log('\nNOTE: This error is expected if the system table is not exposed.');
            console.log('You MUST run the SQL query manually in the Supabase Dashboard.');
        } else {
            console.log('\n--- Active Policies ---');
            if (data.length === 0) {
                console.log('No policies found (or table is empty/inaccessible).');
            } else {
                data.forEach(p => {
                    console.log(`Table: ${p.tablename} | Policy: ${p.policyname} | Cmd: ${p.cmd}`);
                });
            }
        }

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

verifyPolicies();
