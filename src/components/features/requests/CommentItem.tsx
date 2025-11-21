"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentInput } from "./CommentInput";
import type { Comment } from "./types";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onReply: (parentId: string, content: string, mentions: string[]) => Promise<void>;
    onEdit: (commentId: string, content: string, mentions: string[]) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onReaction: (commentId: string, emoji: string) => Promise<void>;
    depth?: number;
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '👀', '🚀', '😄'];

export function CommentItem({
    comment,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    onReaction,
    depth = 0,
}: CommentItemProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

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
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this comment?")) {
            await onDelete(comment.id);
        }
    };

    // Render comment content with highlighted mentions
    const renderContent = () => {
        const parts = comment.content.split(/(@\w+(?:\s+\w+)*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                const mentionedName = part.substring(1);
                const mention = comment.mentions.find(m =>
                    m.mentioned_user_name.toLowerCase() === mentionedName.toLowerCase()
                );
                if (mention) {
                    return (
                        <span
                            key={index}
                            className="text-blue-600 dark:text-blue-400 font-medium"
                        >
                            {part}
                        </span>
                    );
                }
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Group reactions by emoji
    const groupedReactions = comment.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = {
                count: 0,
                userIds: [],
            };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].userIds.push(reaction.user_id);
        return acc;
    }, {} as Record<string, { count: number; userIds: string[] }>);

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
                                            onClick={handleDelete}
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
                            />
                        ) : (
                            <div className="text-sm whitespace-pre-wrap break-words">
                                {renderContent()}
                            </div>
                        )}
                    </div>

                    {/* Reactions */}
                    {!isEditing && (
                        <div className="flex items-center gap-2 mt-1 ml-1">
                            {/* Existing reactions */}
                            {Object.entries(groupedReactions).map(([emoji, data]) => {
                                const hasReacted = data.userIds.includes(currentUserId);
                                return (
                                    <button
                                        key={emoji}
                                        onClick={() => onReaction(comment.id, emoji)}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${hasReacted
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <span>{emoji}</span>
                                        <span className="font-medium">{data.count}</span>
                                    </button>
                                );
                            })}

                            {/* Add reaction button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowReactions(!showReactions)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    😊
                                </button>

                                {showReactions && (
                                    <div className="absolute z-10 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1">
                                        {REACTION_EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    onReaction(comment.id, emoji);
                                                    setShowReactions(false);
                                                }}
                                                className="text-xl hover:scale-125 transition-transform"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reply button */}
                            {depth < maxDepth && (
                                <button
                                    onClick={() => setShowReplyInput(!showReplyInput)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                                >
                                    <MessageSquare className="h-3 w-3" />
                                    Reply
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply input */}
                    {showReplyInput && (
                        <div className="mt-3">
                            <CommentInput
                                onSubmit={handleReplySubmit}
                                onCancel={() => setShowReplyInput(false)}
                                placeholder={`Reply to ${comment.user_name}...`}
                                autoFocus
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
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
