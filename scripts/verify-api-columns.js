const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkColumns() {
    console.log('🔍 Checking requests table schema...\n');

    try {
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        if (!data || data.length === 0) {
            console.log('⚠️  Table is empty');
            return;
        }

        const columns = Object.keys(data[0]);
        console.log('✅ ACTUAL DATABASE COLUMNS:\n');
        columns.forEach((col, i) => {
            console.log(`${(i + 1).toString().padStart(2)}. ${col}`);
        });

        console.log('\n\n🔍 CHECKING API USAGE:\n');

        const apiColumns = [
            'id',
            'title',
            'description',
            'request_type',
            'city_id',
            'created_by',
            'volume',
            'need_answer_by',
            'delivery_date',
            'priority',
            'category',
            'company',
            'status',
            'created_at',
            'updated_at'
        ];

        apiColumns.forEach(col => {
            const exists = columns.includes(col);
            const status = exists ? '✅' : '❌';
            console.log(`${status} ${col}`);
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkColumns().catch(console.error);
