require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    console.log('\n========================================');
    console.log('Running RLS Fix Migration...');
    console.log('========================================\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'docs', 'migrations', 'fix_rls_restaurants.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('SQL to execute:');
    console.log('---');
    console.log(sql);
    console.log('---\n');

    // Split SQL into individual statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + '...\n');

        const { data, error } = await supabase.rpc('exec_sql', {
            query: statement
        });

        if (error) {
            console.error(`❌ Error on statement ${i + 1}:`, error.message);
            console.error('Full error:', error);

            // Try alternative method - direct query
            console.log('\nTrying alternative execution method...');

            // For policies, we need to use the Supabase management API
            // This is a limitation - we can't execute DDL via RPC
            console.log('\n⚠️  Cannot execute DDL statements via Supabase client.');
            console.log('Please run this SQL manually in Supabase SQL Editor:');
            console.log(sqlPath);
            process.exit(1);
        } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
        }
    }

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');
}

runMigration().catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
});
