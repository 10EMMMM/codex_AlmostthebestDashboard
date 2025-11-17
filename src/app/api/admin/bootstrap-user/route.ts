import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ASSIGNABLE_ROLES, Role } from '@/lib/roles';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NORMAL_USER_EMAIL = process.env.NORMAL_USER_EMAIL;
const NORMAL_USER_PASSWORD = process.env.NORMAL_USER_PASSWORD;
const NORMAL_USER_DISPLAY_NAME = process.env.NORMAL_USER_DISPLAY_NAME ?? 'Bootstrap User';
const NORMAL_USER_TIMEZONE = process.env.NORMAL_USER_TIMEZONE ?? 'America/New_York';
const NORMAL_USER_ROLES = process.env.NORMAL_USER_ROLES ?? '';
const NORMAL_USER_CITY_ID = process.env.NORMAL_USER_CITY_ID ?? '';

function parseRoles(raw: string): Role[] {
  return raw
    .split(',')
    .map((role) => role.trim().toUpperCase())
    .filter((role): role is Role => ASSIGNABLE_ROLES.includes(role as Role));
}

export async function POST() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  if (!NORMAL_USER_EMAIL || !NORMAL_USER_PASSWORD) {
    return NextResponse.json({ error: 'NORMAL_USER_EMAIL and NORMAL_USER_PASSWORD must be set' }, { status: 400 });
  }

  const roles = parseRoles(NORMAL_USER_ROLES);
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers({ query: NORMAL_USER_EMAIL });
    const existingUser = existingList?.users?.find((user) => user.email?.toLowerCase() === NORMAL_USER_EMAIL.toLowerCase());

    const targetUser =
      existingUser ||
      (await supabaseAdmin.auth.admin.createUser({
        email: NORMAL_USER_EMAIL,
        password: NORMAL_USER_PASSWORD,
        email_confirm: true,
      })).data?.user;

    if (!targetUser?.id) {
      throw new Error('Unable to create or locate bootstrap user');
    }

    let cityId = NORMAL_USER_CITY_ID;
    if (!cityId) {
      const { data: cityRow } = await supabaseAdmin.from('cities').select('id').limit(1).maybeSingle();
      cityId = cityRow?.id ?? null;
    }

    await supabaseAdmin.from('profiles').upsert({
      user_id: targetUser.id,
      display_name: NORMAL_USER_DISPLAY_NAME,
      timezone: NORMAL_USER_TIMEZONE,
      city_id: cityId,
    });

    if (roles.length) {
      await supabaseAdmin.from('user_roles').upsert(
        roles.map((role) => ({
          user_id: targetUser.id,
          role,
          assigned_by: targetUser.id,
          assigned_at: new Date().toISOString(),
        })),
        { onConflict: 'user_id,role' }
      );
    }

    if (roles.includes('ACCOUNT_MANAGER') && cityId) {
      await supabaseAdmin.from('account_manager_cities').upsert({
        user_id: targetUser.id,
        city_id: cityId,
        assigned_by: targetUser.id,
        assigned_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: existingUser ? 'existing' : 'created',
      email: targetUser.email,
      userId: targetUser.id,
      roles,
    });
  } catch (error: any) {
    console.error('[bootstrap-user] error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to bootstrap user' }, { status: 500 });
  }
}
