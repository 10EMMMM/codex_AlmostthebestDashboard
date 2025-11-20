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

        // Insert into request_assignments table (supports multiple BDRs)
        const { error: insertError } = await supabase
            .from('request_assignments')
            .insert({
                request_id: request_id,
                user_id: bdr_id,
                role: 'BDR',
            });

        if (insertError) {
            // Check if it's a duplicate assignment
            if (insertError.code === '23505') {
                return NextResponse.json({ error: 'BDR already assigned to this request' }, { status: 400 });
            }
            console.error('Error assigning BDR:', insertError);
            return NextResponse.json({ error: 'Failed to assign BDR' }, { status: 500 });
        }

        // Fetch the BDR's profile information
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', bdr_id)
            .single();

        if (profileError) {
            console.error('Error fetching BDR profile:', profileError);
        }

        return NextResponse.json({
            success: true,
            bdr_id: bdr_id,
            bdr_name: profile?.display_name || null,
        });
    } catch (error: any) {
        console.error('Error in /api/admin/assign-bdr:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
