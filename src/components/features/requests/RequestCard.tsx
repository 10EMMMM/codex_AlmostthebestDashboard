import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    Building2,
    User,
    MapPin,
    UserCog,
    Package,
    Calendar,
    Clock,
    Truck,
} from "lucide-react";
import { format } from "date-fns";

// Type definition for Request
interface Request {
    id: string;
    title: string;
    description?: string;
    request_type: string;
    status: string;
    company?: string;
    city_name?: string;
    city_state?: string;
    volume?: number;
    created_at: string;
    need_answer_by?: string;
    delivery_date?: string;
    created_on_behalf?: boolean;
    creator_name?: string;
    requester_name?: string;
    assigned_bdrs?: Array<{
        id: string;
        name: string;
        avatar?: string;
    }>;
}

// Color constants
const REQUEST_TYPE_COLORS: Record<string, string> = {
    RESTAURANT: "bg-emerald-500 text-white",
    EVENT: "bg-blue-500 text-white",
    CUISINE: "bg-purple-500 text-white",
};

const STATUS_COLORS: Record<string, string> = {
    "new": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    "ongoing": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    "on hold": "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    "done": "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    // Legacy/fallback statuses
    NEW: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    PENDING: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    IN_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_HOLD: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    DONE: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    COMPLETED: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    CANCELLED: "bg-gray-500/90 text-white",
    OPEN: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    CLOSED: "bg-slate-500/90 text-white",
};

// Helper function
function getDaysOld(dateString: string): number {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Component props
interface RequestCardProps {
    request: Request;
    onClick: () => void;
    // Selection props
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    selectionMode?: boolean;
}

export function RequestCard({
    request,
    onClick,
    isSelected = false,
    onSelect,
    selectionMode = false
}: RequestCardProps) {
    const daysOld = getDaysOld(request.created_at);
    const isNew = daysOld === 0;

    return (
        <Card
            className={cn(
                "relative bg-card rounded-xl p-6 flex flex-col shadow-lg hover:shadow-xl transition-all cursor-pointer border-0",
                isSelected && "ring-2 ring-primary shadow-2xl"
            )}
            onClick={onClick}
        >
            {/* Selection Checkbox */}
            {selectionMode && (
                <div
                    className="absolute top-3 right-3 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                            onSelect?.(request.id, checked as boolean)
                        }
                        className="h-5 w-5"
                    />
                </div>
            )}

            <div className="space-y-3">
                {/* Header with badges */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${REQUEST_TYPE_COLORS[request.request_type] || "bg-gray-500 text-white"}`}
                            >
                                {request.request_type}
                            </span>
                            <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[request.status] || "bg-gray-500 text-white"}`}
                            >
                                {request.status}
                            </span>
                            {isNew && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                                    New ✨
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-xl line-clamp-2 mb-2">{request.title}</h3>
                    </div>
                </div>

                {/* Description */}
                {request.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {request.description}
                    </p>
                )}

                {/* Details Grid - All Inline */}
                <div className="text-sm space-y-1">
                    {request.company && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span>{request.company}</span>
                        </div>
                    )}
                    {request.requester_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>{request.requester_name}</span>
                        </div>
                    )}
                    {!request.requester_name && request.creator_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>{request.creator_name}</span>
                        </div>
                    )}
                    {request.city_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {request.city_name}
                                {request.city_state && `, ${request.city_state}`}
                            </span>
                        </div>
                    )}
                    {/* Assigned BDRs */}
                    {request.assigned_bdrs && request.assigned_bdrs.length > 0 && (
                        <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1.5">
                                {request.assigned_bdrs.map((bdr) => (
                                    <span key={bdr.id} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                                        {bdr.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {request.volume !== undefined && request.volume !== null && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 flex-shrink-0" />
                            <span>{request.volume}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border text-xs space-y-2">
                    {/* Date badges */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {(() => {
                            const now = new Date();
                            const needAnswerByDate = request.need_answer_by ? new Date(request.need_answer_by) : null;
                            const isOverdueForReply = needAnswerByDate && now > needAnswerByDate;
                            const badgeColor = isOverdueForReply
                                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                : "bg-primary/10 text-primary";

                            return (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                        {isNew ? (
                                            <span>Just created</span>
                                        ) : (
                                            `${daysOld}d old`
                                        )}
                                    </span>
                                </div>
                            );
                        })()}
                        {request.need_answer_by && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">Reply: {format(new Date(request.need_answer_by), "MMM d")}</span>
                            </div>
                        )}
                        {request.delivery_date && (() => {
                            const now = new Date();
                            const deliveryDate = new Date(request.delivery_date);
                            const isOverdue = now > deliveryDate;
                            const badgeColor = isOverdue
                                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400";

                            return (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                    <Truck className="h-3.5 w-3.5" />
                                    <span className="font-medium">Due {format(deliveryDate, "MMM d")}</span>
                                </div>
                            );
                        })()}
                    </div>

                    {request.created_on_behalf && request.requester_name && (
                        <div className="flex items-center gap-2 text-primary">
                            <UserCog className="h-3.5 w-3.5" />
                            <span className="font-medium">Created by admin for {request.requester_name}</span>
                        </div>
                    )}

                </div>
            </div>
        </Card>
    );
}
