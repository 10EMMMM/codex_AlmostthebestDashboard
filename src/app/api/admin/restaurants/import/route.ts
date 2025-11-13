import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization Bearer token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    if (getUserError || !userData?.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const creator = userData.user;
    if (creator.app_metadata?.is_super_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: creator is not a super admin' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    const fileText = await file.text();
    const parsed = Papa.parse<Record<string, string>>(fileText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length) {
      return NextResponse.json({ error: parsed.errors[0].message }, { status: 400 });
    }

    const rows = parsed.data
      .map((row) => ({
        name: row.name?.trim(),
        city_id: row.city_id || null,
        primary_cuisine_id: row.primary_cuisine_id || null,
        onboarded_by: creator.id,
        onboarded_at: new Date().toISOString(),
      }))
      .filter((row) => Boolean(row.name));

    if (!rows.length) {
      return NextResponse.json({ error: 'No valid rows found in CSV.' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from('restaurants').insert(rows);

    if (insertError) {
      console.error('Error inserting restaurant rows:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ inserted: rows.length }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error importing restaurants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
