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

    // 2. Fetch all profiles and account manager cities
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, display_name, timezone, city_id');
    if (profilesError) {
      console.error('Supabase select profiles error:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 400 });
    }

    const { data: accountCities, error: accountCitiesError } = await supabaseAdmin
      .from('account_manager_cities')
      .select('user_id, city_id');
    if (accountCitiesError) {
      console.error('Supabase select account_manager_cities error:', accountCitiesError);
      return NextResponse.json({ error: accountCitiesError.message }, { status: 400 });
    }

    const { data: cities, error: citiesError } = await supabaseAdmin
      .from('cities')
      .select('id, name');
    if (citiesError) {
      console.error('Supabase select cities error:', citiesError);
      return NextResponse.json({ error: citiesError.message }, { status: 400 });
    }

    // 3. Fetch all user roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role');
    if (rolesError) {
      console.error('Supabase select roles error:', rolesError);
      return NextResponse.json({ error: rolesError.message }, { status: 400 });
    }

    // 4. Combine the data
    const profilesMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const rolesMap = new Map<string, string[]>();
    for (const r of roles) {
      if (!rolesMap.has(r.user_id)) {
        rolesMap.set(r.user_id, []);
      }
      rolesMap.get(r.user_id)!.push(r.role);
    }

    const cityNameMap = new Map((cities || []).map((city) => [city.id, city.name]));
    const cityAssignmentMap = new Map<
      string,
      {
        ids: string[];
        names: string[];
      }
    >();
    for (const row of accountCities || []) {
      if (!cityAssignmentMap.has(row.user_id)) {
        cityAssignmentMap.set(row.user_id, { ids: [], names: [] });
      }
      const entry = cityAssignmentMap.get(row.user_id)!;
      if (!entry.ids.includes(row.city_id)) {
        entry.ids.push(row.city_id);
        const name = cityNameMap.get(row.city_id);
        if (name) {
          entry.names.push(name);
        }
      }
    }

    const combinedUsers = authUsers.map(authUser => {
      const profile = profilesMap.get(authUser.id) || {};
      const userRoles = rolesMap.get(authUser.id) || [];
      const assignment = cityAssignmentMap.get(authUser.id);
      return {
        ...authUser,
        ...profile,
        id: authUser.id,
        roles: userRoles,
        city_ids: assignment?.ids ?? [],
        city_names: assignment?.names ?? [],
      };
    });

    return NextResponse.json({ users: combinedUsers }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in get profiles handler:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
