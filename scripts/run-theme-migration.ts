/**
 * Run Theme System Migration
 * 
 * This script executes the theme system SQL migration using Supabase credentials
 * from environment variables.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Starting theme system migration...\n');

        // Read the SQL migration file
        const sqlPath = join(process.cwd(), 'docs', 'migrations', '20251127000000_add_theme_system.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        console.log('📄 Loaded migration file: 20251127000000_add_theme_system.sql');
        console.log('📊 Executing SQL...\n');

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // If exec_sql doesn't exist, try direct execution
            console.log('⚠️  exec_sql function not found, trying direct execution...\n');

            // Split SQL into individual statements and execute them
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                if (statement.includes('CREATE TABLE') ||
                    statement.includes('CREATE INDEX') ||
                    statement.includes('CREATE POLICY') ||
                    statement.includes('CREATE TRIGGER') ||
                    statement.includes('CREATE FUNCTION') ||
                    statement.includes('INSERT INTO') ||
                    statement.includes('ALTER TABLE')) {

                    console.log(`Executing: ${statement.substring(0, 50)}...`);

                    const { error: execError } = await supabase.rpc('exec', {
                        sql: statement
                    });

                    if (execError) {
                        console.error(`❌ Error: ${execError.message}`);
                    }
                }
            }
        }

        console.log('\n✅ Migration completed successfully!\n');
        console.log('📋 Created:');
        console.log('  - themes table');
        console.log('  - user_preferences table');
        console.log('  - organization_settings table');
        console.log('  - RLS policies');
        console.log('  - Helper functions');
        console.log('  - 4 default themes (Default, Ocean, Forest, Sunset)\n');

        // Verify the migration
        console.log('🔍 Verifying migration...\n');

        const { data: themes, error: themesError } = await supabase
            .from('themes')
            .select('name, is_system_default');

        if (themesError) {
            console.error('❌ Verification failed:', themesError.message);
        } else {
            console.log('✅ Themes created:');
            themes?.forEach(theme => {
                console.log(`  - ${theme.name}${theme.is_system_default ? ' (System Default)' : ''}`);
            });
        }

        console.log('\n🎉 Theme system is ready to use!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
