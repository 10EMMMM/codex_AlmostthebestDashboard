import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    context: { params: Promise<{ flagName: string }> }
) {
    const params = await context.params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        return NextResponse.json(
            { error: 'Server misconfigured', isEnabled: false },
            { status: 500 }
        );
    }

    try {
        // Get authorization token
        const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization Bearer token required', isEnabled: false },
                { status: 401 }
            );
        }
        const token = authHeader.split(' ')[1];

        // Create admin client
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Get the current user
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid token', isEnabled: false },
                { status: 401 }
            );
        }

        // Check if user is super admin (always has access to all features)
        const isSuperAdmin = user.app_metadata?.is_super_admin === true;
        if (isSuperAdmin) {
            return NextResponse.json({ isEnabled: true });
        }

        // Check user-specific feature flag target
        const { data: userTarget } = await supabaseAdmin
            .from('feature_flag_targets')
            .select('is_enabled')
            .eq('flag_name', params.flagName)
            .eq('target_type', 'user')
            .eq('target_id', user.id)
            .maybeSingle();

        if (userTarget !== null) {
            return NextResponse.json({ isEnabled: userTarget.is_enabled });
        }

        // Check global feature flag
        const { data: globalFlag } = await supabaseAdmin
            .from('feature_flags')
            .select('is_enabled')
            .eq('name', params.flagName)
            .maybeSingle();

        // Default to false if flag doesn't exist
        return NextResponse.json({
            isEnabled: globalFlag?.is_enabled || false
        });

    } catch (error) {
        console.error('Error checking feature flag:', error);
        return NextResponse.json(
            { error: 'Internal server error', isEnabled: false },
            { status: 500 }
        );
    }
}
