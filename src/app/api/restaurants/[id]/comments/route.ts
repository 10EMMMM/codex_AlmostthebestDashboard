import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/restaurants/[id]/comments
 * Fetch comments for a restaurant
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: restaurantId } = await params;

        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Use Service Role to bypass RLS for fetching, but verify user first
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify User
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: "Invalid authentication" },
                { status: 401 }
            );
        }

        // Fetch Comments
        const { data: comments, error: commentsError } = await supabase
            .from("restaurant_comments")
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    avatar_url
                ),
                restaurant_comment_mentions (
                    id,
                    mentioned_user_id,
                    profiles:mentioned_user_id (
                        display_name
                    )
                ),
                restaurant_comment_reactions (
                    id,
                    user_id,
                    emoji,
                    created_at
                )
            `)
            .eq("restaurant_id", restaurantId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (commentsError) {
            console.error("Error fetching comments:", commentsError);
            return NextResponse.json(
                { error: "Failed to fetch comments" },
                { status: 500 }
            );
        }

        // Transform data to match RestaurantComment interface
        const transformedComments = comments.map((comment: any) => ({
            id: comment.id,
            restaurant_id: comment.restaurant_id,
            user_id: comment.user_id,
            parent_comment_id: comment.parent_comment_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            deleted_at: comment.deleted_at,
            is_edited: comment.is_edited,
            user_name: comment.profiles?.display_name || "Unknown User",
            user_avatar: comment.profiles?.avatar_url,
            mentions: comment.restaurant_comment_mentions.map((m: any) => ({
                id: m.id,
                comment_id: comment.id,
                mentioned_user_id: m.mentioned_user_id,
                mentioned_user_name: m.profiles?.display_name || "Unknown User",
            })),
            reactions: comment.restaurant_comment_reactions.map((r: any) => ({
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
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/restaurants/[id]/comments
 * Create a new comment
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: restaurantId } = await params;

        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify User
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: "Invalid authentication" },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Parse request body
        const body = await request.json();
        const { content, parentCommentId, mentions } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Comment content is required" },
                { status: 400 }
            );
        }

        // Insert comment
        const { data: comment, error: commentError } = await supabase
            .from("restaurant_comments")
            .insert({
                restaurant_id: restaurantId,
                user_id: userId,
                parent_comment_id: parentCommentId || null,
                content: content.trim(),
            })
            .select()
            .single();

        if (commentError) {
            console.error("Error creating comment:", commentError);
            return NextResponse.json(
                { error: "Failed to create comment" },
                { status: 500 }
            );
        }

        // Insert mentions if any
        if (mentions && mentions.length > 0) {
            const mentionRecords = mentions.map((mentionedUserId: string) => ({
                comment_id: comment.id,
                mentioned_user_id: mentionedUserId,
            }));

            const { error: mentionsError } = await supabase
                .from("restaurant_comment_mentions")
                .insert(mentionRecords);

            if (mentionsError) {
                console.error("Error creating mentions:", mentionsError);
            }
        }

        // Fetch the complete comment with user info
        const { data: fullComment } = await supabase
            .from("restaurant_comments")
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    avatar_url
                )
            `)
            .eq("id", comment.id)
            .single();

        const transformedComment = {
            id: fullComment.id,
            restaurant_id: fullComment.restaurant_id,
            user_id: fullComment.user_id,
            parent_comment_id: fullComment.parent_comment_id,
            content: fullComment.content,
            created_at: fullComment.created_at,
            updated_at: fullComment.updated_at,
            deleted_at: fullComment.deleted_at,
            is_edited: fullComment.is_edited,
            user_name: fullComment.profiles?.display_name || "Unknown User",
            user_avatar: fullComment.profiles?.avatar_url,
            mentions: [],
            reactions: [],
            replies: [],
        };

        return NextResponse.json({ comment: transformedComment }, { status: 201 });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
