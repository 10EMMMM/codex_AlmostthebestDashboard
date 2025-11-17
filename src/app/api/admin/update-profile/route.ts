import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ASSIGNABLE_ROLES, Role } from '@/lib/roles';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase service credentials' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json().catch(() => null);
    const userId = body?.user_id;
    const displayName = body?.display_name ?? '';
    const timezone = body?.timezone ?? 'America/New_York';
    const cityIds: string[] | null = Array.isArray(body?.city_ids)
      ? Array.from(new Set(body.city_ids.filter((id: string) => typeof id === 'string')))
      : null;
    const cityId = cityIds?.[0] ?? null;
    const requestedRoles: Role[] | null = Array.isArray(body?.roles)
      ? body.roles.filter((candidate: string): candidate is Role =>
          ASSIGNABLE_ROLES.includes(candidate as Role)
        )
      : null;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: requesterData, error: requesterError } = await supabaseAdmin.auth.getUser(token);
    if (requesterError || requesterData?.user?.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (requestedRoles?.includes('ACCOUNT_MANAGER') && (!cityIds || cityIds.length === 0)) {
      return NextResponse.json({ error: 'Account Managers must have at least one city.' }, { status: 400 });
    }

    await supabaseAdmin.from('profiles').upsert({
      user_id: userId,
      display_name: displayName,
      timezone,
      city_id: cityId,
    });

    if (cityIds) {
      await supabaseAdmin.from('account_manager_cities').delete().eq('user_id', userId);
      if (cityIds.length) {
        await supabaseAdmin.from('account_manager_cities').insert(
          cityIds.map((cid) => ({
            user_id: userId,
            city_id: cid,
            assigned_by: requesterData.user.id,
          }))
        );
      }
    }

    if (requestedRoles) {
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      if (requestedRoles.length) {
        await supabaseAdmin.from('user_roles').insert(
          requestedRoles.map((role) => ({
            user_id: userId,
            role,
            assigned_by: requesterData.user.id,
          }))
        );
      }
    }

    return NextResponse.json({
      user_id: userId,
      display_name: displayName,
      timezone,
      city_id: cityId,
      city_ids: cityIds ?? undefined,
      roles: requestedRoles ?? undefined,
    });
  } catch (error: any) {
    console.error('[update-profile]', error);
    return NextResponse.json({ error: error?.message ?? 'Internal error' }, { status: 500 });
  }
}
