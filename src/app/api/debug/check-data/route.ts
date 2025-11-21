import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

        // Get all requests
        const { data: requests, error: reqError } = await supabase
            .from('requests')
            .select('id, title, request_type')
            .limit(10);

        if (reqError) {
            return NextResponse.json({ error: reqError.message }, { status: 500 });
        }

        // Get all request assignments
        const { data: assignments, error: assignError } = await supabase
            .from('request_assignments')
            .select('request_id, user_id, role, profiles(user_id, display_name)');

        if (assignError) {
            return NextResponse.json({ error: assignError.message }, { status: 500 });
        }

        return NextResponse.json({
            requests: requests || [],
            assignments: assignments || [],
            requestCount: requests?.length || 0,
            assignmentCount: assignments?.length || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
