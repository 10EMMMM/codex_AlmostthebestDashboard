const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatestRestaurant() {
    console.log('Checking latest created restaurant...');

    // 1. Get the latest restaurant
    const { data: restaurants, error: rError } = await supabase
        .from('restaurants')
        .select('id, name, slug, onboarded_by, created_by, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (rError) {
        console.error('Error fetching restaurant:', rError);
        return;
    }

    if (!restaurants || restaurants.length === 0) {
        console.log('No restaurants found.');
        return;
    }

    const latest = restaurants[0];
    console.log('\nLatest Restaurant:');
    console.table(latest);

    // 2. Get profile for onboarder
    if (latest.onboarded_by) {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', latest.onboarded_by)
            .single();

        if (pError) console.error('Error fetching onboarder profile:', pError);
        else console.log(`\nOnboarded By Name: ${profile ? profile.display_name : 'Unknown'}`);
    } else {
        console.log('\nOnboarded By: NULL');
    }

    // 3. Get profile for creator
    if (latest.created_by) {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', latest.created_by)
            .single();

        if (pError) console.error('Error fetching creator profile:', pError);
        else console.log(`Created By Name:   ${profile ? profile.display_name : 'Unknown'}`);
    } else {
        console.log('Created By:        NULL');
    }
}

checkLatestRestaurant();
