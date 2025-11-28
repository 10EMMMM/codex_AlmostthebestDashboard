require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserRoles() {
    console.log('\n========================================');
    console.log('Checking User Roles...');
    console.log('========================================\n');

    // Get all user roles
    const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('*')
        .is('archived_at', null);

    if (error) {
        console.error('❌ Error fetching user roles:', error.message);
        return;
    }

    console.log(`Found ${userRoles.length} active user role(s):\n`);

    userRoles.forEach((ur, index) => {
        console.log(`${index + 1}. User ID: ${ur.user_id}`);
        console.log(`   Role: ${ur.role}`);
        console.log(`   Assigned: ${new Date(ur.assigned_at).toLocaleString()}`);
        console.log('');
    });

    // Check if there are any BDRs or ADMINs
    const bdrs = userRoles.filter(ur => ur.role === 'BDR');
    const admins = userRoles.filter(ur => ur.role === 'ADMIN');

    console.log('📊 Summary:');
    console.log(`   BDRs: ${bdrs.length}`);
    console.log(`   Admins: ${admins.length}`);
    console.log(`   Total: ${userRoles.length}`);

    if (bdrs.length === 0 && admins.length === 0) {
        console.log('\n⚠️  WARNING: No users have BDR or ADMIN roles!');
        console.log('   Restaurant creation requires BDR or ADMIN role.');
        console.log('\n   To fix this, run this SQL in Supabase SQL Editor:');
        console.log('\n   -- Replace YOUR_USER_ID with your actual user ID');
        console.log('   INSERT INTO user_roles (user_id, role, assigned_by)');
        console.log('   VALUES (\'YOUR_USER_ID\', \'ADMIN\', \'YOUR_USER_ID\');');
        console.log('\n   Or to assign to current authenticated user:');
        console.log('   INSERT INTO user_roles (user_id, role, assigned_by)');
        console.log('   VALUES (auth.uid(), \'ADMIN\', auth.uid());');
    } else {
        console.log('\n✅ Users with proper roles exist!');
        console.log('   If you still get RLS errors, make sure:');
        console.log('   1. You are logged in as one of these users');
        console.log('   2. The RLS policies have been applied');
    }

    console.log('\n========================================\n');
}

checkUserRoles();
