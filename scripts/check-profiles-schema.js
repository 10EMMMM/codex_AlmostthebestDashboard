require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesSchema() {
    console.log('Checking profiles table schema...\n');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No data found');
        return;
    }

    const columns = Object.keys(data[0]);
    console.log('Columns in profiles table:');
    columns.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col}`);
    });

    console.log('\nSample data:');
    console.log(JSON.stringify(data[0], null, 2));
}

checkProfilesSchema().catch(console.error);
