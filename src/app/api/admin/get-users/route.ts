import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Get profiles API route hit.');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Authorization check
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    if (getUserError || !userData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const creator = userData.user;

    if (creator.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: creator is not a super admin' }, { status: 403 });
    }

    // 1. Fetch all users from auth.users
    const { data: { users: authUsers }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersError) {
      console.error('Supabase listUsers error:', authUsersError);
      return NextResponse.json({ error: authUsersError.message }, { status: 400 });
    }

    // 2. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('*');
    if (profilesError) {
      console.error('Supabase select profiles error:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 400 });
    }

    // 3. Fetch all user roles
    const { data: roles, error: rolesError } = await supabaseAdmin.from('user_roles').select('user_id, role');
    if (rolesError) {
      console.error('Supabase select roles error:', rolesError);
      return NextResponse.json({ error: rolesError.message }, { status: 400 });
    }

    // 4. Combine the data
    const profilesMap = new Map(profiles.map(p => [p.id, p]));
    const rolesMap = new Map<string, string[]>();
    for (const r of roles) {
      if (!rolesMap.has(r.user_id)) {
        rolesMap.set(r.user_id, []);
      }
      rolesMap.get(r.user_id)!.push(r.role);
    }

    const combinedUsers = authUsers.map(authUser => {
      const profile = profilesMap.get(authUser.id) || {};
      const userRoles = rolesMap.get(authUser.id) || [];
      return {
        ...authUser,
        ...profile,
        id: authUser.id,
        roles: userRoles,
      };
    });

    return NextResponse.json({ users: combinedUsers }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in get profiles handler:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}