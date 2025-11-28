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

async function testAPIQuery() {
    console.log('🧪 Testing exact API query...\n');

    try {
        // Get restaurant ID
        const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .limit(1);

        if (!restaurants || restaurants.length === 0) {
            console.log('❌ No restaurants found');
            return;
        }

        const id = restaurants[0].id;
        console.log(`Testing with ID: ${id}\n`);

        // Test 1: Using * selector (as in the API)
        console.log('1️⃣ Testing with * selector (current API approach):');
        const { data: test1, error: error1 } = await supabase
            .from("restaurants")
            .select(`
                *,
                cities(id, name, state_code),
                cuisines:primary_cuisine_id(id, name)
            `)
            .eq("id", id)
            .single();

        if (error1) {
            console.error('   ❌ Error:', error1);
        } else {
            console.log('   ✅ Success!');
            console.log('   Has description?', 'description' in test1);
            console.log('   Description value:', test1.description);
            console.log('   All keys:', Object.keys(test1).sort().join(', '));
        }

        // Test 2: Explicitly selecting description
        console.log('\n2️⃣ Testing with explicit description selection:');
        const { data: test2, error: error2 } = await supabase
            .from("restaurants")
            .select(`
                id,
                name,
                description,
                cities(id, name, state_code)
            `)
            .eq("id", id)
            .single();

        if (error2) {
            console.error('   ❌ Error:', error2);
        } else {
            console.log('   ✅ Success!');
            console.log('   Has description?', 'description' in test2);
            console.log('   Description value:', test2.description);
        }

        // Test 3: Just description field
        console.log('\n3️⃣ Testing description field only:');
        const { data: test3, error: error3 } = await supabase
            .from("restaurants")
            .select('description')
            .eq("id", id)
            .single();

        if (error3) {
            console.error('   ❌ Error:', error3);
        } else {
            console.log('   ✅ Success!');
            console.log('   Description value:', test3.description);
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testAPIQuery();
