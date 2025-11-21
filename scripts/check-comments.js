const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkComments() {
    try {
        console.log('Connecting to Supabase...');

        // 1. Fetch a batch of requests to find an 'On Hold' one in JS
        // This avoids the SQL ENUM casting issue
        const { data: requests, error: reqError } = await supabase
            .from('requests')
            .select('id, title, status')
            .limit(100);

        if (reqError) throw reqError;

        const targetRequest = requests.find(r => r.status && r.status.toLowerCase() === 'on hold');

        if (!targetRequest) {
            console.log("No 'On Hold' requests found.");
            return;
        }

        const request = targetRequest;
        console.log(`\nChecking Request: "${request.title}" (ID: ${request.id})`);
        console.log(`Status: ${request.status}`);

        // 2. Get all comments for this request (including deleted)
        // Note: Service role bypasses RLS, so we see everything
        const { data: comments, error: commError } = await supabase
            .from('request_comments')
            .select('id, content, deleted_at, user_id')
            .eq('request_id', request.id);

        if (commError) throw commError;

        const total = comments.length;
        const active = comments.filter(c => !c.deleted_at).length;
        const deleted = comments.filter(c => c.deleted_at).length;

        console.log('\n--- Comment Counts (Database) ---');
        console.log(`Total Rows:      ${total}`);
        console.log(`Active (Visible): ${active}`);
        console.log(`Deleted (Hidden): ${deleted}`);

        if (active > 0) {
            console.log('\n--- Active Comments Preview ---');
            comments.filter(c => !c.deleted_at).forEach((c, i) => {
                console.log(`${i + 1}. "${c.content.substring(0, 50)}${c.content.length > 50 ? '...' : ''}"`);
            });
        } else {
            console.log('\nNo active comments found for this request.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkComments();
