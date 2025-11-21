import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PATCH /api/restaurants/[id]/comments/[commentId]
 * Update a comment
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { commentId } = await params;

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
        const { content, mentions } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Comment content is required" },
                { status: 400 }
            );
        }

        // Verify ownership
        const { data: existingComment } = await supabase
            .from("restaurant_comments")
            .select("user_id")
            .eq("id", commentId)
            .single();

        if (!existingComment || existingComment.user_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to edit this comment" },
                { status: 403 }
            );
        }

        // Update comment
        const { error: updateError } = await supabase
            .from("restaurant_comments")
            .update({
                content: content.trim(),
                is_edited: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", commentId);

        if (updateError) {
            console.error("Error updating comment:", updateError);
            return NextResponse.json(
                { error: "Failed to update comment" },
                { status: 500 }
            );
        }

        // Update mentions
        if (mentions) {
            // Delete existing mentions
            await supabase
                .from("restaurant_comment_mentions")
                .delete()
                .eq("comment_id", commentId);

            // Insert new mentions
            if (mentions.length > 0) {
                const mentionRecords = mentions.map((mentionedUserId: string) => ({
                    comment_id: commentId,
                    mentioned_user_id: mentionedUserId,
                }));

                await supabase
                    .from("restaurant_comment_mentions")
                    .insert(mentionRecords);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/restaurants/[id]/comments/[commentId]
 * Soft delete a comment
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { commentId } = await params;

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

        // Verify ownership or admin
        const { data: existingComment } = await supabase
            .from("restaurant_comments")
            .select("user_id")
            .eq("id", commentId)
            .single();

        // Check if user is admin
        const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

        const isAdmin = roles?.some((r: any) => r.role === "ADMIN");

        if (!existingComment || (existingComment.user_id !== userId && !isAdmin)) {
            return NextResponse.json(
                { error: "Unauthorized to delete this comment" },
                { status: 403 }
            );
        }

        // Soft delete comment
        const { error: deleteError } = await supabase
            .from("restaurant_comments")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", commentId);

        if (deleteError) {
            console.error("Error deleting comment:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
