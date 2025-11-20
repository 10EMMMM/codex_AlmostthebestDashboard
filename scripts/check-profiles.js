require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log('Checking public.profiles table...\n');

    // Count total profiles
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    console.log(`Total profiles in table: ${count}`);

    if (count === 0) {
        console.log('\n❌ The profiles table is EMPTY!');
        console.log('This is why no display names are showing.');
        console.log('\nYou need to either:');
        console.log('1. Create profile records for existing users');
        console.log('2. Use the auth.users fallback (which I just added)');
        return;
    }

    // Show sample profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    console.log('\nSample profiles:');
    profiles?.forEach(p => {
        console.log(`  User: ${p.user_id}`);
        console.log(`    display_name: ${p.display_name || '(null)'}`);
        console.log(`    email: ${p.email || '(null)'}`);
        console.log('');
    });
}

checkProfiles().catch(console.error);
