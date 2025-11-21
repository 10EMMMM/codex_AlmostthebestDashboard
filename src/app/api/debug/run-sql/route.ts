import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Query 1: Count comments for an 'On Hold' request
        const { data: counts, error: countError } = await supabase.rpc('run_sql_query', {
            query: `
                WITH target_request AS (
                    SELECT id, title, status
                    FROM requests
                    WHERE status ILIKE 'on hold'
                    LIMIT 1
                )
                SELECT 
                    r.title, 
                    r.status,
                    COUNT(rc.id) as total_comments_in_db,
                    COUNT(rc.id) FILTER (WHERE rc.deleted_at IS NULL) as active_comments,
                    COUNT(rc.id) FILTER (WHERE rc.deleted_at IS NOT NULL) as deleted_comments
                FROM target_request r
                LEFT JOIN request_comments rc ON r.id = rc.request_id
                GROUP BY r.id, r.title, r.status;
            `
        });

        // Since we can't easily run arbitrary SQL without a specific RPC function, 
        // let's use the JS client to approximate the query for the user.

        // 1. Find an 'On Hold' request
        const { data: requests } = await supabase
            .from('requests')
            .select('id, title, status')
            .ilike('status', 'on hold')
            .limit(1);

        if (!requests || requests.length === 0) {
            return NextResponse.json({ message: "No 'On Hold' requests found." });
        }

        const request = requests[0];

        // 2. Get all comments for this request (including deleted)
        const { data: comments } = await supabase
            .from('request_comments')
            .select('id, content, deleted_at')
            .eq('request_id', request.id);

        const total = comments?.length || 0;
        const active = comments?.filter(c => !c.deleted_at).length || 0;
        const deleted = comments?.filter(c => c.deleted_at).length || 0;

        return NextResponse.json({
            request: {
                title: request.title,
                status: request.status,
                id: request.id
            },
            counts: {
                total_in_db: total,
                active_on_card: active,
                deleted: deleted
            },
            comments_preview: comments?.slice(0, 5)
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
