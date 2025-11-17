import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ASSIGNABLE_ROLES, Role } from '@/lib/roles';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json().catch(() => null);
    const email = body?.email;
    const password = body?.password;
    const requestedRoles: Role[] = Array.isArray(body?.roles)
      ? body.roles.filter((candidate: string): candidate is Role =>
          ASSIGNABLE_ROLES.includes(candidate as Role)
        )
      : [];
    const cityIds: string[] = Array.isArray(body?.city_ids)
      ? Array.from(new Set(body.city_ids.filter((id: string) => typeof id === 'string')))
      : [];
    const shouldCreateSuperAdmin = body?.is_super_admin === true;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    if (getUserError) {
      console.error('Error verifying token for creator:', getUserError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const creator = userData?.user;
    if (!creator?.id) {
      return NextResponse.json({ error: 'Unable to identify creator' }, { status: 401 });
    }

    if (creator.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: creator is not a super admin' }, { status: 403 });
    }

    if (requestedRoles.includes('ACCOUNT_MANAGER') && cityIds.length === 0) {
      return NextResponse.json({ error: 'Account Managers must have at least one city.' }, { status: 400 });
    }

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      ...(shouldCreateSuperAdmin ? { app_metadata: { is_super_admin: true } } : {}),
    });

    if (createError) {
      console.error('Supabase createUser error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = createData?.user?.id;
    if (userId) {
      await supabaseAdmin.from('profiles').upsert({
        user_id: userId,
        display_name: body?.display_name ?? '',
        timezone: body?.timezone ?? 'America/New_York',
        city_id: cityIds[0] ?? null,
      });

      if (requestedRoles.length) {
        await supabaseAdmin.from('user_roles').insert(
          requestedRoles.map((role) => ({
            user_id: userId,
            role,
            assigned_by: creator.id,
          }))
        );
      }

      if (requestedRoles.includes('ACCOUNT_MANAGER') && cityIds.length) {
        await supabaseAdmin.from('account_manager_cities').delete().eq('user_id', userId);
        await supabaseAdmin.from('account_manager_cities').insert(
          cityIds.map((cityId) => ({
            user_id: userId,
            city_id: cityId,
            assigned_by: creator.id,
          }))
        );
      }
    }

    return NextResponse.json({
      user: {
        ...createData?.user,
        city_ids: cityIds,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in create user handler:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
