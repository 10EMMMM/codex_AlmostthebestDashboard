const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatusValues() {
    console.log('🔍 Checking valid status values...\n');

    try {
        // Get all unique status values from existing requests
        const { data, error } = await supabase
            .from('requests')
            .select('status');

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        const uniqueStatuses = [...new Set(data.map(r => r.status))].filter(Boolean);

        console.log('✅ EXISTING STATUS VALUES IN DATABASE:\n');
        uniqueStatuses.forEach((status, i) => {
            console.log(`${(i + 1).toString().padStart(2)}. "${status}"`);
        });

        console.log('\n💡 Use one of these values for new requests');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkStatusValues().catch(console.error);
