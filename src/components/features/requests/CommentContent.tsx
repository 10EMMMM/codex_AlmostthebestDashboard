import type { Comment } from "./types";

interface CommentContentProps {
    content: string;
    mentions: Comment['mentions'];
}

export function CommentContent({ content, mentions }: CommentContentProps) {
    const parts = content.split(/(@\w+(?:\s+\w+)*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    const mentionedName = part.substring(1);
                    const mention = mentions.find(m =>
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
            })}
        </>
    );
}
