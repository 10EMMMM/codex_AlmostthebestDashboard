const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRestaurantAPI() {
    console.log('🧪 Testing Restaurant API Endpoint...\n');

    try {
        // Get the restaurant ID
        const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id, name')
            .limit(1);

        if (!restaurants || restaurants.length === 0) {
            console.log('❌ No restaurants found');
            return;
        }

        const restaurantId = restaurants[0].id;
        console.log(`📍 Testing with restaurant: ${restaurants[0].name} (${restaurantId})\n`);

        // Simulate the API call
        console.log('1️⃣ Simulating API fetch...');
        const { data: restaurant, error } = await supabase
            .from("restaurants")
            .select(`
                *,
                cities(id, name, state_code),
                cuisines:primary_cuisine_id(id, name)
            `)
            .eq("id", restaurantId)
            .single();

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('✅ Raw restaurant data:');
        console.log(JSON.stringify(restaurant, null, 2));

        console.log('\n2️⃣ Checking specific fields:');
        console.log('   - description:', restaurant.description || '(null/empty)');
        console.log('   - name:', restaurant.name);
        console.log('   - city_name:', restaurant.cities?.name);
        console.log('   - cuisine_name:', restaurant.cuisines?.name);

        // Fetch cuisines
        console.log('\n3️⃣ Fetching cuisines from restaurant_cuisines...');
        const { data: restaurantCuisines } = await supabase
            .from("restaurant_cuisines")
            .select(`
                cuisine_id,
                is_primary,
                display_order,
                cuisines (
                    id,
                    name
                )
            `)
            .eq("restaurant_id", restaurantId)
            .order("display_order", { ascending: true });

        console.log('   Cuisines found:', restaurantCuisines?.length || 0);
        if (restaurantCuisines && restaurantCuisines.length > 0) {
            restaurantCuisines.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.cuisines?.name} (${c.is_primary ? 'PRIMARY' : 'SECONDARY'})`);
            });
        }

        const cuisines = restaurantCuisines || [];
        const primaryCuisine = cuisines.find((c) => c.is_primary);
        const secondaryCuisines = cuisines.filter((c) => !c.is_primary);

        console.log('\n4️⃣ Formatted response (as API would return):');
        const formattedRestaurant = {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            city_name: restaurant.cities?.name,
            city_state: restaurant.cities?.state_code,
            cuisine_name: primaryCuisine?.cuisines?.name,
            secondary_cuisine_name: secondaryCuisines.length > 0 ? secondaryCuisines[0].cuisines?.name : null,
        };
        console.log(JSON.stringify(formattedRestaurant, null, 2));

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testRestaurantAPI();
