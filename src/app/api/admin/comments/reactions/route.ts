import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/admin/comments/reactions
 * Add a reaction to a comment
 * Body: { commentId, emoji }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { commentId, emoji } = body;

        if (!commentId || !emoji) {
            return NextResponse.json(
                { error: 'Comment ID and emoji are required' },
                { status: 400 }
            );
        }

        // Get auth token
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        // Add reaction (will fail if duplicate due to UNIQUE constraint)
        const { data: reaction, error: reactionError } = await supabase
            .from('comment_reactions')
            .insert({
                comment_id: commentId,
                user_id: user.id,
                emoji,
            })
            .select()
            .single();

        if (reactionError) {
            // Check if it's a duplicate
            if (reactionError.code === '23505') {
                return NextResponse.json(
                    { error: 'Reaction already exists' },
                    { status: 409 }
                );
            }
            console.error('Error adding reaction:', reactionError);
            return NextResponse.json(
                { error: 'Failed to add reaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({ reaction });
    } catch (error) {
        console.error('Error in POST /api/admin/comments/reactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/comments/reactions
 * Remove a reaction from a comment
 * Body: { commentId, emoji }
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { commentId, emoji } = body;

        if (!commentId || !emoji) {
            return NextResponse.json(
                { error: 'Comment ID and emoji are required' },
                { status: 400 }
            );
        }

        // Get auth token
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        // Remove reaction
        const { error: deleteError } = await supabase
            .from('comment_reactions')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .eq('emoji', emoji);

        if (deleteError) {
            console.error('Error removing reaction:', deleteError);
            return NextResponse.json(
                { error: 'Failed to remove reaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/comments/reactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
