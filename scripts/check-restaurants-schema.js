require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRestaurantsSchema() {
    console.log('\n========================================');
    console.log('Checking RESTAURANTS table schema...');
    console.log('========================================\n');

    try {
        // Query the information_schema to get column details
        const { data, error } = await supabase
            .rpc('exec_sql', {
                query: `
                    SELECT 
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'restaurants'
                    ORDER BY ordinal_position;
                `
            });

        if (error) {
            // If RPC doesn't exist, try a simple select to see what columns exist
            console.log('RPC method not available, trying direct query...\n');

            const { data: testData, error: testError } = await supabase
                .from('restaurants')
                .select('*')
                .limit(1);

            if (testError) {
                console.error('Error querying restaurants:', testError);
                return;
            }

            if (testData && testData.length > 0) {
                console.log('Available columns in restaurants table:');
                console.log('=====================================\n');
                Object.keys(testData[0]).forEach(column => {
                    console.log(`  ✓ ${column}`);
                });
            } else {
                console.log('No data in restaurants table yet.');
                console.log('Attempting to insert a test row to see required columns...\n');

                // Try inserting with minimal data to see what's required
                const { error: insertError } = await supabase
                    .from('restaurants')
                    .insert({
                        name: 'TEST_SCHEMA_CHECK',
                    });

                if (insertError) {
                    console.log('Insert error (this helps us see what columns exist):');
                    console.log(insertError.message);
                }
            }
            return;
        }

        if (data && data.length > 0) {
            console.log('Columns in RESTAURANTS table:');
            console.log('==============================\n');
            data.forEach(col => {
                console.log(`  Column: ${col.column_name}`);
                console.log(`    Type: ${col.data_type}`);
                console.log(`    Nullable: ${col.is_nullable}`);
                console.log(`    Default: ${col.column_default || 'none'}`);
                console.log('');
            });
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }

    console.log('\n========================================\n');
}

checkRestaurantsSchema();
