const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRestaurant() {
    console.log('Checking "Saucy Asian" restaurant...');

    // 1. Get the restaurant
    const { data: restaurants, error: rError } = await supabase
        .from('restaurants')
        .select('id, name, onboarded_by, created_at')
        .ilike('name', '%Saucy Asian%');

    if (rError) {
        console.error('Error fetching restaurant:', rError);
        return;
    }

    if (!restaurants || restaurants.length === 0) {
        console.log('Restaurant "Saucy Asian" not found.');
        return;
    }

    console.log('\nFound Restaurants:');
    console.table(restaurants);

    // 2. Get all profiles to map IDs to names
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('user_id, display_name');

    if (pError) {
        console.error('Error fetching profiles:', pError);
        return;
    }

    console.log('\nUser Profiles:');
    console.table(profiles);

    // 3. Match them up
    restaurants.forEach(r => {
        const onboarder = profiles.find(p => p.user_id === r.onboarded_by);
        console.log(`\nRestaurant: ${r.name}`);
        console.log(`- Created At: ${r.created_at}`);
        console.log(`- Onboarded By ID: ${r.onboarded_by}`);
        console.log(`- Onboarded By Name: ${onboarder ? onboarder.display_name : 'UNKNOWN/NULL'}`);
    });
}

checkRestaurant();
