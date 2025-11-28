require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function scanDatabaseSchema() {
    console.log('\n========================================');
    console.log('Scanning Database Schema...');
    console.log('========================================\n');

    const tables = [
        'profiles',
        'user_roles',
        'restaurants',
        'restaurant_cuisines',
        'restaurant_contacts',
        'restaurant_assignments'
    ];

    for (const tableName of tables) {
        console.log(`\n📋 Table: ${tableName}`);
        console.log('='.repeat(50));

        // Try to get one row to see the schema
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            console.log(`❌ Error: ${error.message}`);
            console.log(`   (Table may not exist or no access)`);
        } else if (data && data.length > 0) {
            console.log('✅ Columns:');
            Object.keys(data[0]).forEach(column => {
                const value = data[0][column];
                const type = typeof value;
                console.log(`   • ${column} (${type})`);
            });
        } else {
            console.log('⚠️  Table exists but is empty');
            console.log('   Attempting insert to discover schema...');

            // Try minimal insert
            const { error: insertError } = await supabase
                .from(tableName)
                .insert({});

            if (insertError) {
                console.log(`   Error message: ${insertError.message}`);
            }
        }
    }

    // Check for profiles table structure specifically
    console.log('\n\n🔍 Checking profiles/user_roles structure...');
    console.log('='.repeat(50));

    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileData && profileData.length > 0) {
        console.log('\n✅ profiles table columns:');
        Object.keys(profileData[0]).forEach(col => {
            console.log(`   • ${col}`);
        });
    }

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

    if (roleData && roleData.length > 0) {
        console.log('\n✅ user_roles table columns:');
        Object.keys(roleData[0]).forEach(col => {
            console.log(`   • ${col}`);
        });
    }

    console.log('\n========================================');
    console.log('Schema scan complete!');
    console.log('========================================\n');
}

scanDatabaseSchema();
