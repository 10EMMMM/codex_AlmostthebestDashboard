import { RequestCard } from "./RequestCard";
import { RequestCardSkeleton } from "./RequestCardSkeleton";
import type { Request } from "./types";

interface KanbanColumnProps {
    title: string;
    borderColor: string;
    textColor: string;
    count: number;
    loading: boolean;
    requests: Request[];
    onRequestClick: (request: Request) => void;
}

export function KanbanColumn({
    title,
    borderColor,
    textColor,
    count,
    loading,
    requests,
    onRequestClick,
}: KanbanColumnProps) {
    return (
        <div className="flex flex-col min-w-[320px]">
            <div className={`mb-4 pb-2 border-b-2 ${borderColor}`}>
                <h2 className={`text-lg font-bold ${textColor}`}>{title}</h2>
                <p className="text-xs text-muted-foreground">
                    {loading ? '...' : count} requests
                </p>
            </div>
            <div className="space-y-3">
                {loading ? (
                    [...Array(2)].map((_, i) => (
                        <RequestCardSkeleton key={i} />
                    ))
                ) : (
                    requests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onClick={() => onRequestClick(request)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
