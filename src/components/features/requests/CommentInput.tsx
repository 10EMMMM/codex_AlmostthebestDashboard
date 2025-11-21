"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import type { TeamMember } from "@/components/features/requests/types";

interface CommentInputProps {
    onSubmit: (content: string, mentions: string[]) => Promise<void>;
    placeholder?: string;
    initialValue?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
    allowedMentions?: string[]; // List of user IDs allowed to be mentioned
}

export function CommentInput({
    onSubmit,
    placeholder = "Add a comment...",
    initialValue = "",
    onCancel,
    autoFocus = false,
    allowedMentions,
}: CommentInputProps) {
    const [content, setContent] = useState(initialValue);
    const [submitting, setSubmitting] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStartPos, setMentionStartPos] = useState(0);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { searchMembers } = useTeamMembers();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    // Auto-focus if requested
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    // Handle text change and detect @ mentions
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = newContent.substring(0, cursorPos);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

        if (lastAtSymbol !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
            // Check if there's a space after @, if so, don't show mentions
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setMentionQuery(textAfterAt);
                setMentionStartPos(lastAtSymbol);
                setShowMentions(true);
                setSelectedMentionIndex(0);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    // Get filtered team members for mention autocomplete
    const allMembers = showMentions ? searchMembers(mentionQuery) : [];
    const filteredMembers = allowedMentions
        ? allMembers.filter(member => allowedMentions.includes(member.id))
        : allMembers;

    // Handle mention selection
    const selectMention = (member: TeamMember) => {
        const before = content.substring(0, mentionStartPos);
        const after = content.substring(textareaRef.current?.selectionStart || content.length);
        const newContent = `${before}@${member.display_name} ${after}`;
        setContent(newContent);
        setShowMentions(false);

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current?.focus();
            const newCursorPos = mentionStartPos + member.display_name.length + 2;
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Handle keyboard navigation in mention list
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentions && filteredMembers.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedMentionIndex(prev =>
                    prev < filteredMembers.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedMentionIndex(prev =>
                    prev > 0 ? prev - 1 : filteredMembers.length - 1
                );
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                selectMention(filteredMembers[selectedMentionIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowMentions(false);
            }
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            // Cmd/Ctrl + Enter to submit
            e.preventDefault();
            handleSubmit();
        }
    };

    // Extract mentioned user IDs from content
    const extractMentions = (): string[] => {
        const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
        const mentions: string[] = [];
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            const mentionedName = match[1];
            const members = searchMembers(mentionedName);
            const exactMatch = members.find(m =>
                m.display_name.toLowerCase() === mentionedName.toLowerCase()
            );
            if (exactMatch) {
                mentions.push(exactMatch.id);
            }
        }

        return [...new Set(mentions)]; // Remove duplicates
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!content.trim() || submitting) return;

        setSubmitting(true);
        try {
            const mentions = extractMentions();
            await onSubmit(content.trim(), mentions);
            setContent("");
            setShowMentions(false);
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <div className="space-y-2">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[80px] resize-none"
                    disabled={submitting}
                />

                {/* Mention autocomplete dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                    <div className="absolute z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredMembers.map((member, index) => (
                            <button
                                key={member.id}
                                onClick={() => selectMention(member)}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${index === selectedMentionIndex
                                    ? "bg-gray-100 dark:bg-gray-700"
                                    : ""
                                    }`}
                            >
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.display_name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                                        {member.display_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {member.display_name}
                                    </div>
                                    {member.email && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {member.email}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Type @ to mention someone • Cmd/Ctrl + Enter to submit
                    </div>
                    <div className="flex gap-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                disabled={submitting}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!content.trim() || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-1" />
                                    Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
