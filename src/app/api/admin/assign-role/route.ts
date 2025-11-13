import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Assign role API route hit.');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 1) Validate body
    const body = await request.json().catch(() => null);
    const user_id = body?.user_id;
    const role = body?.role;

    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 });
    }
    
    const validRoles = ['BDR', 'ACCOUNT_MANAGER', 'TEAM_LEAD'];
    if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // 2) Authorization check (ensure creator is a super admin)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    if (getUserError || !userData.user) {
      console.error('Error verifying token for creator:', getUserError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const creator = userData.user;

    if (creator.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: creator is not a super admin' }, { status: 403 });
    }

    // 3) Upsert the role into the public.user_roles table
    // Upsert will create or update the user's role.
    console.log(`[API] Upserting role for user_id: ${user_id}, role: ${role}`);
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: user_id, 
        role: role,
        created_at: new Date().toISOString()
      })
      .select();

    if (upsertError) {
      console.error('[API] Supabase upsert role error:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    // 4) Success
    console.log('[API] Upsert successful:', upsertData);
    return NextResponse.json({ user_role: upsertData[0] }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in assign role handler:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
