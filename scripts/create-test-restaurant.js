require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Service role bypasses RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestRestaurant() {
    console.log('\n========================================');
    console.log('Creating Test Restaurant (bypassing RLS)...');
    console.log('========================================\n');

    try {
        // Get a city ID
        const { data: cities } = await supabase
            .from('cities')
            .select('id, name')
            .limit(1);

        if (!cities || cities.length === 0) {
            console.error('No cities found. Please add a city first.');
            return;
        }

        const cityId = cities[0].id;
        console.log(`Using city: ${cities[0].name} (${cityId})`);

        // Get a cuisine ID
        const { data: cuisines } = await supabase
            .from('cuisines')
            .select('id, name')
            .limit(1);

        if (!cuisines || cuisines.length === 0) {
            console.error('No cuisines found. Please add cuisines first.');
            return;
        }

        const cuisineId = cuisines[0].id;
        console.log(`Using cuisine: ${cuisines[0].name} (${cuisineId})\n`);

        // Create restaurant
        console.log('Inserting restaurant...');
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .insert({
                name: 'TEST RESTAURANT - RLS BYPASS',
                city_id: cityId,
                primary_cuisine_id: cuisineId,
                description: 'Test restaurant created via service role to bypass RLS',
                discount_percentage: '15% off first order',
                offers_box_meals: true,
                offers_trays: false,
                earliest_pickup_time: '11:00:00',
            })
            .select()
            .single();

        if (restaurantError) {
            console.error('❌ Failed to create restaurant:', restaurantError.message);
            console.error('Error code:', restaurantError.code);
            console.error('Error details:', restaurantError.details);
            return;
        }

        console.log('✅ Restaurant created:', restaurant.id);
        console.log('   Name:', restaurant.name);

        // Create cuisine link
        console.log('\nInserting cuisine link...');
        const { error: cuisineError } = await supabase
            .from('restaurant_cuisines')
            .insert({
                restaurant_id: restaurant.id,
                cuisine_id: cuisineId,
                is_primary: true,
                display_order: 0,
            });

        if (cuisineError) {
            console.error('❌ Failed to create cuisine link:', cuisineError.message);
        } else {
            console.log('✅ Cuisine link created');
        }

        // Create contact
        console.log('\nInserting contact...');
        const { error: contactError } = await supabase
            .from('restaurant_contacts')
            .insert({
                restaurant_id: restaurant.id,
                full_name: 'Test Contact',
                email: 'test@example.com',
                phone: '555-1234',
                street: '123 Test St',
                is_primary: true,
            });

        if (contactError) {
            console.error('❌ Failed to create contact:', contactError.message);
        } else {
            console.log('✅ Contact created');
        }

        console.log('\n========================================');
        console.log('✅ Test restaurant created successfully!');
        console.log('Restaurant ID:', restaurant.id);
        console.log('========================================\n');

        console.log('If this worked, RLS is NOT the problem.');
        console.log('If you still can\'t create via the UI, the issue is with:');
        console.log('  1. User authentication');
        console.log('  2. User role assignment');
        console.log('  3. RLS policies not matching user roles\n');

    } catch (error) {
        console.error('\n❌ Unexpected error:', error);
    }
}

createTestRestaurant();
