require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testContactInsert() {
    console.log('\n========================================');
    console.log('Testing restaurant_contacts insert...');
    console.log('========================================\n');

    // First create a test restaurant
    const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({ name: 'TEST_FOR_CONTACT_SCHEMA' })
        .select('id')
        .single();

    if (restaurantError) {
        console.error('Failed to create test restaurant:', restaurantError);
        return;
    }

    console.log('Created test restaurant:', restaurant.id);
    console.log('');

    // Try inserting a contact with minimal data
    const testContact = {
        restaurant_id: restaurant.id,
        full_name: 'Test Contact',
        is_primary: true,
    };

    console.log('Attempting contact insert with:', JSON.stringify(testContact, null, 2));
    console.log('');

    const { data, error } = await supabase
        .from('restaurant_contacts')
        .insert(testContact)
        .select();

    if (error) {
        console.log('❌ Insert failed:');
        console.log('Error Message:', error.message);
        console.log('Error Code:', error.code);
    } else {
        console.log('✅ Insert succeeded!');
        console.log('');
        console.log('Available columns in restaurant_contacts:');
        console.log('==========================================\n');
        Object.keys(data[0]).forEach(column => {
            console.log(`  ✓ ${column}: ${JSON.stringify(data[0][column])}`);
        });
    }

    // Clean up
    await supabase.from('restaurants').delete().eq('id', restaurant.id);
    console.log('\n(Test data deleted)');
    console.log('\n========================================\n');
}

testContactInsert();
