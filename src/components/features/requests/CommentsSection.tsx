"use client";

import { useEffect, useState } from "react";
import { useComments } from "@/hooks/useComments";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import type { Request } from "./types";
import { MessageSquare, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CommentsSectionProps {
    request: Request;
}

export function CommentsSection({ request }: CommentsSectionProps) {
    const requestId = request.id;
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const {
        comments,
        loading,
        submitting,
        createComment,
        updateComment,
        deleteComment,
        addReaction,
    } = useComments(requestId);

    // Calculate allowed mentions (involved users)
    const allowedMentions = [
        ...(request.assigned_bdrs || []).map(bdr => bdr.id),
        request.requester_id
    ].filter(Boolean); // Remove null/undefined

    // Get current user ID
    useEffect(() => {
        const getCurrentUser = async () => {
            const supabase = (window as any).supabase;
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };

        getCurrentUser();
    }, []);

    const [isInputVisible, setIsInputVisible] = useState(false);

    // Handle new comment
    const handleNewComment = async (content: string, mentions: string[]) => {
        await createComment({
            request_id: requestId,
            content,
            mentions,
        });
        setIsInputVisible(false);
    };

    // Handle reply
    const handleReply = async (parentId: string, content: string, mentions: string[]) => {
        await createComment({
            request_id: requestId,
            content,
            parent_comment_id: parentId,
            mentions,
        });
    };

    // Handle edit
    const handleEdit = async (commentId: string, content: string, mentions: string[]) => {
        await updateComment(commentId, content, mentions);
    };

    // Handle delete
    const handleDelete = async (commentId: string) => {
        await deleteComment(commentId);
    };

    // Handle reaction
    const handleReaction = async (commentId: string, emoji: string) => {
        await addReaction(commentId, emoji);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">
                        Comments & Notes
                    </h3>
                    <span className="text-sm text-gray-500">
                        ({comments.length})
                    </span>
                </div>
                {!isInputVisible && (
                    <button
                        onClick={() => setIsInputVisible(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        + Add Comment
                    </button>
                )}
            </div>

            <Separator />

            {/* New comment input */}
            {isInputVisible && (
                <div className="mb-4">
                    <CommentInput
                        onSubmit={handleNewComment}
                        placeholder="Add a comment or note..."
                        allowedMentions={allowedMentions}
                        onCancel={() => setIsInputVisible(false)}
                        autoFocus
                    />
                </div>
            )}

            {/* Comments list */}
            {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReaction={handleReaction}
                            allowedMentions={allowedMentions}
                        />
                    ))}
                </div>
            )}

            {/* Loading indicator for submissions */}
            {submitting && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Posting comment...</span>
                </div>
            )}
        </div>
    );
}
