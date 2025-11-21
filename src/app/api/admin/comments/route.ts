import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/admin/comments
 * Fetch comments for a request
 * Query params: requestId
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Get auth token from header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        // Use Service Role to bypass RLS for fetching, but verify user first
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Verify User
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        const userId = user.id;

        // 2. Check Permissions Manually
        // Fetch request details and user roles in parallel
        const [requestResponse, rolesResponse, assignmentResponse] = await Promise.all([
            supabase.from('requests').select('created_by, requester_id').eq('id', requestId).single(),
            supabase.from('user_roles').select('role').eq('user_id', userId),
            supabase.from('request_assignments').select('role').eq('request_id', requestId).eq('user_id', userId)
        ]);

        const reqData = requestResponse.data;
        const userRoles = rolesResponse.data?.map(r => r.role) || [];
        const assignments = assignmentResponse.data?.map(a => a.role) || [];

        const isCreator = reqData?.created_by === userId;
        const isRequester = reqData?.requester_id === userId;
        const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('super_admin');
        const isAssignedBDR = assignments.includes('BDR');

        // Allow if: Admin, Assigned BDR, Creator, or Requester
        if (!isAdmin && !isAssignedBDR && !isCreator && !isRequester) {
            // Return empty list instead of error to avoid UI breakage, or 403?
            // UI expects an array. If we return 403, it might show error.
            // Returning empty array is safer for "no access to comments".
            return NextResponse.json({ comments: [] });
        }

        // 3. Fetch Comments (Bypassing RLS)
        const { data: comments, error: commentsError } = await supabase
            .from('request_comments')
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    avatar_url
                ),
                comment_mentions (
                    id,
                    mentioned_user_id,
                    profiles:mentioned_user_id (
                        display_name
                    )
                ),
                comment_reactions (
                    id,
                    user_id,
                    emoji,
                    created_at
                )
            `)
            .eq('request_id', requestId)
            .is('deleted_at', null)
            .order('created_at', { ascending: true });

        if (commentsError) {
            console.error('Error fetching comments:', commentsError);
            return NextResponse.json(
                { error: 'Failed to fetch comments' },
                { status: 500 }
            );
        }

        // Transform data to match Comment interface
        const transformedComments = comments.map((comment: any) => ({
            id: comment.id,
            request_id: comment.request_id,
            user_id: comment.user_id,
            parent_comment_id: comment.parent_comment_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            deleted_at: comment.deleted_at,
            is_edited: comment.is_edited,
            user_name: comment.profiles?.display_name || 'Unknown User',
            user_avatar: comment.profiles?.avatar_url,
            mentions: comment.comment_mentions.map((m: any) => ({
                id: m.id,
                comment_id: comment.id,
                mentioned_user_id: m.mentioned_user_id,
                mentioned_user_name: m.profiles?.display_name || 'Unknown User',
            })),
            reactions: comment.comment_reactions.map((r: any) => ({
                id: r.id,
                comment_id: comment.id,
                user_id: r.user_id,
                emoji: r.emoji,
                created_at: r.created_at,
            })),
        }));

        // Build threaded structure
        const commentMap = new Map();
        const rootComments: any[] = [];

        transformedComments.forEach((comment: any) => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });

        transformedComments.forEach((comment: any) => {
            if (comment.parent_comment_id) {
                const parent = commentMap.get(comment.parent_comment_id);
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return NextResponse.json({ comments: rootComments });
    } catch (error) {
        console.error('Error in GET /api/admin/comments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/comments
 * Create a new comment
 * Body: { requestId, content, parentCommentId?, mentions: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, content, parentCommentId, mentions = [] } = body;

        if (!requestId || !content) {
            return NextResponse.json(
                { error: 'Request ID and content are required' },
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

        // Create comment
        const { data: comment, error: commentError } = await supabase
            .from('request_comments')
            .insert({
                request_id: requestId,
                user_id: user.id,
                parent_comment_id: parentCommentId || null,
                content: content.trim(),
            })
            .select()
            .single();

        if (commentError) {
            console.error('Error creating comment:', commentError);
            return NextResponse.json(
                { error: 'Failed to create comment' },
                { status: 500 }
            );
        }

        // Create mentions if any
        if (mentions.length > 0) {
            const mentionRecords = mentions.map((userId: string) => ({
                comment_id: comment.id,
                mentioned_user_id: userId,
            }));

            const { error: mentionError } = await supabase
                .from('comment_mentions')
                .insert(mentionRecords);

            if (mentionError) {
                console.error('Error creating mentions:', mentionError);
                // Don't fail the request, just log the error
            }
        }

        // Fetch the created comment with all relations
        const { data: fullComment, error: fetchError } = await supabase
            .from('request_comments')
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    avatar_url
                ),
                comment_mentions (
                    id,
                    mentioned_user_id,
                    profiles:mentioned_user_id (
                        display_name
                    )
                ),
                comment_reactions (
                    id,
                    user_id,
                    emoji,
                    created_at
                )
            `)
            .eq('id', comment.id)
            .single();

        if (fetchError) {
            console.error('Error fetching created comment:', fetchError);
            return NextResponse.json({ comment });
        }

        // Transform to match interface
        const transformedComment = {
            id: fullComment.id,
            request_id: fullComment.request_id,
            user_id: fullComment.user_id,
            parent_comment_id: fullComment.parent_comment_id,
            content: fullComment.content,
            created_at: fullComment.created_at,
            updated_at: fullComment.updated_at,
            deleted_at: fullComment.deleted_at,
            is_edited: fullComment.is_edited,
            user_name: fullComment.profiles?.display_name || 'Unknown User',
            user_avatar: fullComment.profiles?.avatar_url,
            mentions: fullComment.comment_mentions.map((m: any) => ({
                id: m.id,
                comment_id: fullComment.id,
                mentioned_user_id: m.mentioned_user_id,
                mentioned_user_name: m.profiles?.display_name || 'Unknown User',
            })),
            reactions: fullComment.comment_reactions.map((r: any) => ({
                id: r.id,
                comment_id: fullComment.id,
                user_id: r.user_id,
                emoji: r.emoji,
                created_at: r.created_at,
            })),
            replies: [],
        };

        return NextResponse.json({ comment: transformedComment });
    } catch (error) {
        console.error('Error in POST /api/admin/comments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/comments
 * Update a comment
 * Body: { commentId, content, mentions: string[] }
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { commentId, content, mentions = [] } = body;

        if (!commentId || !content) {
            return NextResponse.json(
                { error: 'Comment ID and content are required' },
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

        // Update comment
        const { data: comment, error: updateError } = await supabase
            .from('request_comments')
            .update({ content: content.trim() })
            .eq('id', commentId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating comment:', updateError);
            return NextResponse.json(
                { error: 'Failed to update comment' },
                { status: 500 }
            );
        }

        // Update mentions - delete old ones and create new ones
        await supabase
            .from('comment_mentions')
            .delete()
            .eq('comment_id', commentId);

        if (mentions.length > 0) {
            const mentionRecords = mentions.map((userId: string) => ({
                comment_id: commentId,
                mentioned_user_id: userId,
            }));

            await supabase
                .from('comment_mentions')
                .insert(mentionRecords);
        }

        return NextResponse.json({ comment });
    } catch (error) {
        console.error('Error in PATCH /api/admin/comments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/comments
 * Soft delete a comment
 * Body: { commentId }
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { commentId } = body;

        if (!commentId) {
            return NextResponse.json(
                { error: 'Comment ID is required' },
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
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Verify User (Optional but good practice)
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        const timestamp = new Date().toISOString();

        // 2. Recursive Soft Delete Function
        // We need to find all descendants and delete them.
        // Since Supabase doesn't support recursive CTEs in the JS client easily for updates,
        // we'll do a fetch-then-update approach or a stored procedure.
        // A stored procedure is best, but let's try a robust JS approach for now.

        // Helper to get all descendant IDs
        const getDescendantIds = async (parentId: string): Promise<string[]> => {
            const { data: children } = await supabase
                .from('request_comments')
                .select('id')
                .eq('parent_comment_id', parentId)
                .is('deleted_at', null); // Only fetch active children

            if (!children || children.length === 0) return [];

            let ids = children.map(c => c.id);
            for (const child of children) {
                const grandChildren = await getDescendantIds(child.id);
                ids = [...ids, ...grandChildren];
            }
            return ids;
        };

        const idsToDelete = await getDescendantIds(commentId);
        idsToDelete.push(commentId); // Add the target comment itself

        // 3. Perform Bulk Soft Delete
        const { error: deleteError } = await supabase
            .from('request_comments')
            .update({ deleted_at: timestamp })
            .in('id', idsToDelete);

        if (deleteError) {
            console.error('Error deleting comments:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete comment' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, count: idsToDelete.length });
    } catch (error) {
        console.error('Error in DELETE /api/admin/comments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
