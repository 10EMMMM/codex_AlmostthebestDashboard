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

async function inventoryColumns() {
    console.log('🔍 Inventorying public.requests table columns...\n');

    try {
        // Method 1: Try to get sample record
        const { data: sampleData, error: sampleError } = await supabase
            .from('requests')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.error('❌ Error querying table:', sampleError.message);
            console.error('Code:', sampleError.code);
            console.error('Details:', sampleError.details);
            return;
        }

        if (!sampleData || sampleData.length === 0) {
            console.log('⚠️  Table is empty. Trying count query...\n');

            const { count, error: countError } = await supabase
                .from('requests')
                .select('*', { count: 'exact', head: true });

            if (countError) {
                console.error('❌ Count error:', countError.message);
                return;
            }

            console.log(`📊 Table exists with ${count} records`);
            console.log('\n💡 Since table is empty, trying to get column names from insert...\n');

            // Try to see what columns the table expects by doing a dry-run insert
            const { error: insertError } = await supabase
                .from('requests')
                .insert({})
                .select();

            if (insertError) {
                console.log('Insert error reveals required columns:');
                console.log(insertError.message);
            }
            return;
        }

        // We have a sample record
        const record = sampleData[0];
        const columns = Object.keys(record);

        console.log('✅ Successfully retrieved table schema from actual data!\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('| # | Column Name | Type | Sample Value |');
        console.log('|---|-------------|------|--------------|');

        columns.forEach((key, index) => {
            const value = record[key];
            let valueType = typeof value;
            let sampleValue = '-';

            if (value === null) {
                valueType = 'null';
                sampleValue = 'NULL';
            } else if (typeof value === 'string') {
                if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                    valueType = 'timestamp';
                    sampleValue = value.substring(0, 10);
                } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    valueType = 'date';
                    sampleValue = value;
                } else if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/i)) {
                    valueType = 'uuid';
                    sampleValue = value.substring(0, 8) + '...';
                } else {
                    sampleValue = value.substring(0, 20);
                    if (value.length > 20) sampleValue += '...';
                }
            } else if (typeof value === 'number') {
                sampleValue = value.toString();
            } else if (typeof value === 'boolean') {
                sampleValue = value ? 'true' : 'false';
            }

            console.log(`| ${(index + 1).toString().padStart(2)} | ${key.padEnd(20)} | ${valueType.padEnd(10)} | ${sampleValue} |`);
        });

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log(`\n📊 Total columns found: ${columns.length}`);
        console.log(`🎯 Sample record ID: ${record.id}\n`);

        // Check for specific columns
        console.log('\n🔍 Checking for specific columns:\n');
        const checkColumns = ['volume', 'need_answer_by', 'budget', 'priority', 'category', 'deadline'];
        checkColumns.forEach(col => {
            const exists = columns.includes(col);
            const status = exists ? '✅ EXISTS' : '❌ NOT FOUND';
            console.log(`${status}: ${col}`);
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.error(error);
    }
}

inventoryColumns().catch(console.error);
