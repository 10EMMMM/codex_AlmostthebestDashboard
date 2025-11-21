"use client";

import { useEffect, useState } from "react";
import { useRestaurantComments } from "@/hooks/useRestaurantComments";
import { MessageSquare, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RestaurantCommentsProps {
    restaurantId: string;
    onRefresh?: () => Promise<void>;
}

export function RestaurantComments({ restaurantId, onRefresh }: RestaurantCommentsProps) {
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");

    const {
        comments,
        loading,
        submitting,
        createComment,
        refreshComments,
    } = useRestaurantComments(restaurantId);

    // Get current user ID
    useEffect(() => {
        const getCurrentUser = async () => {
            const supabase = (window as any).supabase;
            if (!supabase) return;

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };

        getCurrentUser();
    }, []);

    // Handle new comment
    const handleNewComment = async () => {
        if (!newCommentContent.trim()) return;

        await createComment({
            content: newCommentContent,
            mentions: [], // TODO: Add mention support
        });

        setNewCommentContent("");
        setIsInputVisible(false);
        if (onRefresh) await onRefresh();
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
                    <h3 className="text-lg font-semibold">Comments & Notes</h3>
                    <span className="text-sm text-gray-500">({comments.length})</span>
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
                <div className="mb-4 space-y-2">
                    <Textarea
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Add a comment or note..."
                        rows={3}
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsInputVisible(false);
                                setNewCommentContent("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleNewComment}
                            disabled={submitting || !newCommentContent.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                "Post Comment"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Comments list */}
            {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="border-l-2 border-gray-200 pl-4 py-2 space-y-2"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                        {comment.user_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    {comment.is_edited && (
                                        <span className="text-xs text-gray-400">(edited)</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-4 mt-3 space-y-3">
                                    {comment.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="border-l-2 border-gray-200 pl-4 py-2 space-y-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">
                                                    {reply.user_name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(reply.created_at).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>
                                                {reply.is_edited && (
                                                    <span className="text-xs text-gray-400">
                                                        (edited)
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {reply.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
