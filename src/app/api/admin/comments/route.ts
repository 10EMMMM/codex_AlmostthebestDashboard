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
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Fetch comments with user info, mentions, and reactions
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
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Soft delete by setting deleted_at
        const { error: deleteError } = await supabase
            .from('request_comments')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', commentId);

        if (deleteError) {
            console.error('Error deleting comment:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete comment' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/comments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
