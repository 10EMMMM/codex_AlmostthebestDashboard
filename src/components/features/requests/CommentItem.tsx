"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentInput } from "./CommentInput";
import { CommentContent } from "./CommentContent";
import { CommentReactions } from "./CommentReactions";
import type { Comment } from "./types";
import { formatDistanceToNow } from "date-fns";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onReply: (parentId: string, content: string, mentions: string[]) => Promise<void>;
    onEdit: (commentId: string, content: string, mentions: string[]) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onReaction: (commentId: string, emoji: string) => Promise<void>;
    depth?: number;
    allowedMentions?: string[];
}

export function CommentItem({
    comment,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    onReaction,
    depth = 0,
    allowedMentions,
}: CommentItemProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isOwnComment = comment.user_id === currentUserId;
    const maxDepth = 3; // Maximum nesting level

    // Format timestamp
    const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

    // Handle reply submission
    const handleReplySubmit = async (content: string, mentions: string[]) => {
        await onReply(comment.id, content, mentions);
        setShowReplyInput(false);
    };

    // Handle edit submission
    const handleEditSubmit = async (content: string, mentions: string[]) => {
        await onEdit(comment.id, content, mentions);
        setIsEditing(false);
    };

    // Handle delete
    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        await onDelete(comment.id);
        setShowDeleteDialog(false);
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {comment.user_avatar ? (
                        <img
                            src={comment.user_avatar}
                            alt={comment.user_name}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                            {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Comment content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                    {comment.user_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {timeAgo}
                                </span>
                                {comment.is_edited && (
                                    <span className="text-xs text-gray-500 italic">
                                        (edited)
                                    </span>
                                )}
                            </div>

                            {/* Actions menu (only for own comments) */}
                            {isOwnComment && !isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleDeleteClick}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Content */}
                        {isEditing ? (
                            <CommentInput
                                initialValue={comment.content}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                                placeholder="Edit your comment..."
                                autoFocus
                                allowedMentions={allowedMentions}
                            />
                        ) : (
                            <div className="text-sm whitespace-pre-wrap break-words">
                                <CommentContent content={comment.content} mentions={comment.mentions} />
                            </div>
                        )}
                    </div>

                    {/* Reactions */}
                    {!isEditing && (
                        <CommentReactions
                            comment={comment}
                            currentUserId={currentUserId}
                            onReaction={onReaction}
                            onReplyClick={() => setShowReplyInput(!showReplyInput)}
                            showReplyButton={depth < maxDepth}
                        />
                    )}

                    {/* Reply input */}
                    {showReplyInput && (
                        <div className="mt-3">
                            <CommentInput
                                onSubmit={handleReplySubmit}
                                onCancel={() => setShowReplyInput(false)}
                                placeholder={`Reply to ${comment.user_name}...`}
                                autoFocus
                                allowedMentions={allowedMentions}
                            />
                        </div>
                    )}

                    {/* Nested replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2">
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onReaction={onReaction}
                                    depth={depth + 1}
                                    allowedMentions={allowedMentions}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
