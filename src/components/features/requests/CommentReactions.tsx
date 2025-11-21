"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Comment } from "./types";

interface CommentReactionsProps {
    comment: Comment;
    currentUserId: string;
    onReaction: (commentId: string, emoji: string) => Promise<void>;
    onReplyClick?: () => void;
    showReplyButton?: boolean;
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '👀', '🚀', '😄'];

export function CommentReactions({
    comment,
    currentUserId,
    onReaction,
    onReplyClick,
    showReplyButton = true,
}: CommentReactionsProps) {
    const [showReactions, setShowReactions] = useState(false);

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
            {showReplyButton && onReplyClick && (
                <button
                    onClick={onReplyClick}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                >
                    <MessageSquare className="h-3 w-3" />
                    Reply
                </button>
            )}
        </div>
    );
}
