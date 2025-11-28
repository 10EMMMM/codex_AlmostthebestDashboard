require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDiscountColumn() {
    console.log('\n========================================');
    console.log('Checking discount_percentage column...');
    console.log('========================================\n');

    // Create a test restaurant to see the schema
    const { data, error } = await supabase
        .from('restaurants')
        .select('discount_percentage')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Query successful!');
        if (data && data.length > 0) {
            console.log('Sample data:', data[0]);
        } else {
            console.log('No data in table yet');
        }
    }

    // Try inserting with text
    console.log('\n\nTrying to insert with text discount...');
    const { data: insertData, error: insertError } = await supabase
        .from('restaurants')
        .insert({
            name: 'TEST_DISCOUNT_CHECK',
            discount_percentage: '20% off first order'
        })
        .select();

    if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        console.error('Error code:', insertError.code);
        console.error('This confirms the column is still NUMERIC type');
    } else {
        console.log('✅ Insert succeeded! Column is TEXT type');
        // Clean up
        if (insertData && insertData[0]) {
            await supabase
                .from('restaurants')
                .delete()
                .eq('id', insertData[0].id);
            console.log('Test data cleaned up');
        }
    }

    console.log('\n========================================\n');
}

checkDiscountColumn();
