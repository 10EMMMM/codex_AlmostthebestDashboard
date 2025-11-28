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

    // Get all users with their roles
    const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
            user_id,
            role,
            assigned_at,
            archived_at,
            profiles!inner(display_name, email:user_id)
        `)
        .is('archived_at', null);

    if (error) {
        console.error('❌ Error fetching user roles:', error.message);
        return;
    }

    console.log('Active User Roles:\n');
    console.table(userRoles.map(ur => ({
        'Display Name': ur.profiles?.display_name || 'N/A',
        'User ID': ur.user_id.substring(0, 8) + '...',
        'Role': ur.role,
        'Assigned': new Date(ur.assigned_at).toLocaleDateString(),
    })));

    // Check if there are any BDRs or ADMINs
    const bdrs = userRoles.filter(ur => ur.role === 'BDR');
    const admins = userRoles.filter(ur => ur.role === 'ADMIN');

    console.log('\n📊 Summary:');
    console.log(`   BDRs: ${bdrs.length}`);
    console.log(`   Admins: ${admins.length}`);

    if (bdrs.length === 0 && admins.length === 0) {
        console.log('\n⚠️  WARNING: No users have BDR or ADMIN roles!');
        console.log('   You need to assign a role to your user in the user_roles table.');
        console.log('\n   Run this SQL in Supabase SQL Editor:');
        console.log('   INSERT INTO user_roles (user_id, role, assigned_by)');
        console.log('   VALUES (auth.uid(), \'ADMIN\', auth.uid());');
    }

    // Check RLS policies
    console.log('\n\n========================================');
    console.log('Checking RLS Policies...');
    console.log('========================================\n');

    const { data: policies, error: policyError } = await supabase
        .rpc('exec_sql', {
            query: `
                SELECT schemaname, tablename, policyname, permissive, roles, cmd
                FROM pg_policies
                WHERE tablename IN ('restaurants', 'restaurant_cuisines', 'restaurant_contacts', 'restaurant_assignments')
                ORDER BY tablename, policyname;
            `
        });

    if (policyError) {
        console.log('⚠️  Cannot check policies via RPC (expected)');
        console.log('   Please check policies manually in Supabase dashboard');
    }

    console.log('\n========================================\n');
}

checkUserRoles();
