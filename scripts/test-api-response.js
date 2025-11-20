require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAPIResponse() {
    console.log('Testing what the API would return...\n');

    // Get one request
    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .limit(1);

    if (error || !requests || requests.length === 0) {
        console.log('No requests found');
        return;
    }

    const req = requests[0];
    console.log('Request data:');
    console.log(`  ID: ${req.id}`);
    console.log(`  Title: ${req.title}`);
    console.log(`  created_by: ${req.created_by}`);
    console.log(`  requester_id: ${req.requester_id}`);
    console.log('');

    // Fetch profiles
    const userIds = [req.created_by, req.requester_id].filter(Boolean);
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

    console.log('Profiles found:');
    if (profiles && profiles.length > 0) {
        profiles.forEach(p => {
            console.log(`  User ID: ${p.user_id}`);
            console.log(`    display_name: ${p.display_name || '(null)'}`);
            console.log(`    email: ${p.email || '(null)'}`);
            console.log('');
        });
    } else {
        console.log('  No profiles found!');
    }

    // Show what would be returned
    const profileMap = new Map();
    profiles?.forEach(p => profileMap.set(p.user_id, p));

    const creator = profileMap.get(req.created_by);
    const requester = profileMap.get(req.requester_id);

    console.log('What API would return:');
    console.log(`  creator_name: ${creator?.display_name || creator?.email || '(null)'}`);
    console.log(`  requester_name: ${requester?.display_name || requester?.email || '(null)'}`);
}

testAPIResponse().catch(console.error);
