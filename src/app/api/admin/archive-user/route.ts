import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Snapshot = {
  profile: Record<string, any> | null;
  account_manager_city_ids: string[];
  auth_user: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
    banned_until?: string | null;
    app_metadata?: Record<string, any>;
    user_metadata?: Record<string, any>;
  } | null;
};

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
    const reason: string | null = typeof body?.reason === 'string' ? body.reason.trim() : null;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: requesterData, error: requesterError } = await supabaseAdmin.auth.getUser(token);
    if (requesterError || !requesterData?.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const requester = requesterData.user;
    if (requester.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (requester.id === userId) {
      return NextResponse.json({ error: 'You cannot archive yourself.' }, { status: 400 });
    }

    const targetUserResponse = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetUserResponse.error || !targetUserResponse.data?.user) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    const targetUser = targetUserResponse.data.user;

    const [{ data: profileData, error: profileError }, { data: rolesData, error: rolesError }, { data: cityData, error: cityError }] =
      await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabaseAdmin.from('user_roles').select('role').eq('user_id', userId),
        supabaseAdmin.from('account_manager_cities').select('city_id').eq('user_id', userId),
      ]);

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[archive-user] profile fetch', profileError);
      return NextResponse.json({ error: 'Unable to load profile.' }, { status: 400 });
    }
    if (rolesError) {
      console.error('[archive-user] roles fetch', rolesError);
      return NextResponse.json({ error: 'Unable to load roles.' }, { status: 400 });
    }
    if (cityError) {
      console.error('[archive-user] city fetch', cityError);
      return NextResponse.json({ error: 'Unable to load city assignments.' }, { status: 400 });
    }

    const snapshot: Snapshot = {
      profile: profileData ?? null,
      account_manager_city_ids: (cityData ?? []).map((row) => row.city_id),
      auth_user: targetUser
        ? {
            id: targetUser.id,
            email: targetUser.email ?? undefined,
            created_at: targetUser.created_at,
            last_sign_in_at: targetUser.last_sign_in_at,
            banned_until: (targetUser as any).banned_until ?? null,
            app_metadata: targetUser.app_metadata,
            user_metadata: targetUser.user_metadata,
          }
        : null,
    };

    const rolesSnapshot = (rolesData ?? []).map((row) => row.role);
    const archiveReason = reason && reason.length ? reason : null;

    await supabaseAdmin.from('archived_users').insert({
      user_id: userId,
      profile_snapshot: snapshot,
      roles_snapshot: rolesSnapshot,
      archived_by: requester.id,
      archive_reason: archiveReason,
    });

    await supabaseAdmin
      .from('profiles')
      .update({
        archived_at: new Date().toISOString(),
        archived_by: requester.id,
        archive_reason: archiveReason,
      })
      .eq('user_id', userId);

    await supabaseAdmin.from('user_archive_log').insert({
      user_id: userId,
      action: 'ARCHIVE',
      performed_by: requester.id,
      reason: archiveReason,
    });

    return NextResponse.json({ status: 'archived' });
  } catch (error: any) {
    console.error('[archive-user] unexpected error', error);
    return NextResponse.json({ error: error?.message ?? 'Internal error' }, { status: 500 });
  }
}
