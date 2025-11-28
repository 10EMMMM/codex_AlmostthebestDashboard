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

async function checkRestaurantDescription() {
    console.log('🔍 Checking restaurant description field...\n');

    try {
        // 1. Fetch a sample restaurant to see the structure
        console.log('1️⃣ Fetching sample restaurant data...');
        const { data: sampleRestaurant, error: sampleError } = await supabase
            .from('restaurants')
            .select('id, name, description, created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (sampleError) {
            console.error('❌ Error fetching sample:', sampleError);
        } else if (sampleRestaurant) {
            console.log('✅ Sample restaurant:');
            console.log('   ID:', sampleRestaurant.id);
            console.log('   Name:', sampleRestaurant.name);
            console.log('   Description:', sampleRestaurant.description || '(null/empty)');
            console.log('   Description length:', sampleRestaurant.description?.length || 0);
        }

        console.log('\n2️⃣ Fetching all restaurants with description status...');
        const { data: restaurants, error: listError } = await supabase
            .from('restaurants')
            .select('id, name, description')
            .order('created_at', { ascending: false })
            .limit(10);

        if (listError) {
            console.error('❌ Error fetching restaurants:', listError);
        } else if (restaurants) {
            console.log(`✅ Found ${restaurants.length} restaurants:\n`);
            restaurants.forEach((r, index) => {
                const status = r.description
                    ? `✓ HAS (${r.description.length} chars)`
                    : '✗ EMPTY/NULL';
                console.log(`   ${index + 1}. ${r.name}`);
                console.log(`      Description: ${status}`);
                if (r.description) {
                    console.log(`      Preview: ${r.description.substring(0, 100)}${r.description.length > 100 ? '...' : ''}`);
                }
                console.log('');
            });
        }

        // 3. Get statistics
        console.log('3️⃣ Getting statistics...');
        const { data: allRestaurants, error: statsError } = await supabase
            .from('restaurants')
            .select('description');

        if (statsError) {
            console.error('❌ Error fetching stats:', statsError);
        } else if (allRestaurants) {
            const total = allRestaurants.length;
            const withDescription = allRestaurants.filter(r => r.description && r.description.trim() !== '').length;
            const withoutDescription = total - withDescription;
            const percentage = total > 0 ? ((withDescription / total) * 100).toFixed(2) : 0;

            console.log('✅ Statistics:');
            console.log(`   Total restaurants: ${total}`);
            console.log(`   With description: ${withDescription} (${percentage}%)`);
            console.log(`   Without description: ${withoutDescription}`);
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkRestaurantDescription();
