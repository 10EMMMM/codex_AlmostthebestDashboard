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

async function checkRestaurantsSchema() {
    console.log('🔍 Checking restaurants table schema...\n');

    try {
        // Get a sample restaurant to see all available columns
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('❌ Error fetching restaurant:', error);
            return;
        }

        console.log('✅ Available columns in restaurants table:\n');
        const columns = Object.keys(restaurant).sort();

        columns.forEach((col, index) => {
            const value = restaurant[col];
            const type = typeof value;
            const preview = value !== null && value !== undefined
                ? (type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value)
                : value;

            console.log(`${index + 1}. ${col}`);
            console.log(`   Type: ${type}`);
            console.log(`   Value: ${JSON.stringify(preview)}`);
            console.log('');
        });

        // Specifically check for description-related columns
        console.log('🔎 Searching for description-related columns:');
        const descriptionColumns = columns.filter(col =>
            col.toLowerCase().includes('desc') ||
            col.toLowerCase().includes('note') ||
            col.toLowerCase().includes('detail')
        );

        if (descriptionColumns.length > 0) {
            console.log('   Found:', descriptionColumns.join(', '));
            descriptionColumns.forEach(col => {
                console.log(`   - ${col}: ${JSON.stringify(restaurant[col])}`);
            });
        } else {
            console.log('   ❌ No description-related columns found!');
        }

        // Check if 'description' exists
        console.log('\n📝 Checking for "description" column specifically:');
        if ('description' in restaurant) {
            console.log('   ✅ "description" column EXISTS');
            console.log('   Value:', restaurant.description);
        } else {
            console.log('   ❌ "description" column DOES NOT EXIST');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkRestaurantsSchema();
