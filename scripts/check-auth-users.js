require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
    console.log('Checking auth.users for display name data...\n');

    // Get the user IDs from a request
    const { data: requests } = await supabase
        .from('requests')
        .select('created_by, requester_id')
        .limit(1);

    if (!requests || requests.length === 0) {
        console.log('No requests found');
        return;
    }

    const userIds = [requests[0].created_by, requests[0].requester_id].filter(Boolean);
    console.log('Looking up user IDs:', userIds);
    console.log('');

    // Try to get user data from auth.users using admin API
    for (const userId of userIds) {
        const { data: user, error } = await supabase.auth.admin.getUserById(userId);

        if (error) {
            console.log(`Error fetching user ${userId}:`, error.message);
            continue;
        }

        console.log(`User ID: ${userId}`);
        console.log(`  Email: ${user.user?.email}`);
        console.log(`  user_metadata:`, JSON.stringify(user.user?.user_metadata, null, 2));
        console.log(`  app_metadata:`, JSON.stringify(user.user?.app_metadata, null, 2));
        console.log('');
    }
}

checkAuthUsers().catch(console.error);
