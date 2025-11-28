require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
    console.log('\n========================================');
    console.log('Testing minimal restaurant insert...');
    console.log('========================================\n');

    // Try inserting with only the most basic fields
    const testData = {
        name: 'SCHEMA_TEST_RESTAURANT',
        // Add other fields one by one to see what's required
    };

    console.log('Attempting insert with:', JSON.stringify(testData, null, 2));
    console.log('');

    const { data, error } = await supabase
        .from('restaurants')
        .insert(testData)
        .select();

    if (error) {
        console.log('❌ Insert failed (this tells us what columns are required):');
        console.log('');
        console.log('Error Message:', error.message);
        console.log('Error Code:', error.code);
        console.log('Error Details:', error.details);
        console.log('Error Hint:', error.hint);
        console.log('');
        console.log('Full error object:');
        console.log(JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Insert succeeded!');
        console.log('');
        console.log('Returned data shows available columns:');
        console.log(JSON.stringify(data, null, 2));

        // Clean up test data
        if (data && data[0] && data[0].id) {
            await supabase
                .from('restaurants')
                .delete()
                .eq('id', data[0].id);
            console.log('\n(Test restaurant deleted)');
        }
    }

    console.log('\n========================================\n');
}

testInsert();
