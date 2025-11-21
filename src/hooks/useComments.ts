import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Comment, CreateCommentData } from "@/components/features/requests/types";

/**
 * Custom hook for managing comments on a request
 * Includes real-time updates via Supabase subscriptions
 */
export function useComments(requestId: string) {
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    /**
     * Load comments from API
     */
    const loadComments = useCallback(async () => {
        if (!requestId) return;

        setLoading(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `/api/admin/comments?requestId=${requestId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const data = await response.json();
            setComments(data.comments || []);
        } catch (error: any) {
            console.error("Error loading comments:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load comments",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [requestId, toast]);

    /**
     * Create a new comment
     */
    const createComment = async (data: CreateCommentData) => {
        setSubmitting(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch("/api/admin/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create comment");
            }

            const result = await response.json();

            // Optimistically update UI
            if (data.parent_comment_id) {
                // Add as reply
                setComments(prevComments => {
                    const addReply = (comments: Comment[]): Comment[] => {
                        return comments.map(comment => {
                            if (comment.id === data.parent_comment_id) {
                                return {
                                    ...comment,
                                    replies: [...(comment.replies || []), result.comment],
                                };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReply(comment.replies),
                                };
                            }
                            return comment;
                        });
                    };
                    return addReply(prevComments);
                });
            } else {
                // Add as root comment
                setComments(prev => [...prev, result.comment]);
            }

            toast({
                title: "Success",
                description: "Comment added successfully",
            });

            return result.comment;
        } catch (error: any) {
            console.error("Error creating comment:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create comment",
                variant: "destructive",
            });
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Update an existing comment
     */
    const updateComment = async (commentId: string, content: string, mentions: string[]) => {
        setSubmitting(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch("/api/admin/comments", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId, content, mentions }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update comment");
            }

            // Reload comments to get updated data
            await loadComments();

            toast({
                title: "Success",
                description: "Comment updated successfully",
            });
        } catch (error: any) {
            console.error("Error updating comment:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update comment",
                variant: "destructive",
            });
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Soft delete a comment
     */
    const deleteComment = async (commentId: string) => {
        setSubmitting(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch("/api/admin/comments", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete comment");
            }

            // Remove from local state
            setComments(prevComments => {
                const removeComment = (comments: Comment[]): Comment[] => {
                    return comments.filter(comment => {
                        if (comment.id === commentId) return false;
                        if (comment.replies && comment.replies.length > 0) {
                            comment.replies = removeComment(comment.replies);
                        }
                        return true;
                    });
                };
                return removeComment(prevComments);
            });

            toast({
                title: "Success",
                description: "Comment deleted successfully",
            });
        } catch (error: any) {
            console.error("Error deleting comment:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete comment",
                variant: "destructive",
            });
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Add a reaction to a comment
     */
    const addReaction = async (commentId: string, emoji: string) => {
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch("/api/admin/comments/reactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId, emoji }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    // Already reacted, remove it instead
                    await removeReaction(commentId, emoji);
                    return;
                }
                throw new Error(errorData.error || "Failed to add reaction");
            }

            // Reload comments to get updated reactions
            await loadComments();
        } catch (error: any) {
            console.error("Error adding reaction:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add reaction",
                variant: "destructive",
            });
        }
    };

    /**
     * Remove a reaction from a comment
     */
    const removeReaction = async (commentId: string, emoji: string) => {
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch("/api/admin/comments/reactions", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId, emoji }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to remove reaction");
            }

            // Reload comments to get updated reactions
            await loadComments();
        } catch (error: any) {
            console.error("Error removing reaction:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to remove reaction",
                variant: "destructive",
            });
        }
    };

    // Load comments on mount and when requestId changes
    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Set up real-time subscription
    useEffect(() => {
        if (!requestId) return;

        const supabase = (window as any).supabase;
        if (!supabase) return;

        // Subscribe to comment changes
        const channel = supabase
            .channel(`comments:${requestId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'request_comments',
                    filter: `request_id=eq.${requestId}`,
                },
                () => {
                    // Reload comments when any change occurs
                    loadComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, loadComments]);

    return {
        comments,
        loading,
        submitting,
        loadComments,
        createComment,
        updateComment,
        deleteComment,
        addReaction,
        removeReaction,
    };
}
