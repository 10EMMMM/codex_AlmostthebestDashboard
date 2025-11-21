import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Verify the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const { request_id, bdr_id } = body;

        if (!request_id || !bdr_id) {
            return NextResponse.json({ error: 'Missing request_id or bdr_id' }, { status: 400 });
        }

        // Delete from request_assignments table
        const { error: deleteError } = await supabase
            .from('request_assignments')
            .delete()
            .eq('request_id', request_id)
            .eq('user_id', bdr_id)
            .eq('role', 'BDR');

        if (deleteError) {
            console.error('Error unassigning BDR:', deleteError);
            return NextResponse.json({ error: 'Failed to unassign BDR' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            bdr_id: bdr_id,
        });
    } catch (error: any) {
        console.error('Error in /api/admin/unassign-bdr:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
