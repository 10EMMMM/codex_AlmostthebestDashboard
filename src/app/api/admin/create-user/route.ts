import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

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
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    // 2) Extract and validate Authorization header (creator's access token)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 3) Verify the token and fetch the creator's user
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    if (getUserError) {
      console.error('Error verifying token for creator:', getUserError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const creator = userData?.user;
    if (!creator?.id) {
      return NextResponse.json({ error: 'Unable to identify creator' }, { status: 401 });
    }

    // 4) Authorization: ensure creator is a super admin
    if (creator.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: creator is not a super admin' }, { status: 403 });
    }

    // 5) Create the new user and grant is_super_admin
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { is_super_admin: true },
    });

    if (createError) {
      console.error('Supabase createUser error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 6) Success — return created user (omit sensitive fields if you prefer)
    return NextResponse.json({ user: createData?.user }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in create user handler:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}