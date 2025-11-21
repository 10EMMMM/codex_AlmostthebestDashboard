import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    MapPin,
    UserCog,
    MessageSquare,
    UtensilsCrossed,
    TrendingUp,
} from "lucide-react";
import type { Restaurant } from "@/components/features/restaurants/types";
import { RESTAURANT_STATUS_CONFIG } from "@/components/features/restaurants/constants";
import { formatRelativeDate } from "@/components/features/restaurants/utils";

// Component props
interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: () => void;
    // Selection props
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    selectionMode?: boolean;
}

export function RestaurantCard({
    restaurant,
    onClick,
    isSelected = false,
    onSelect,
    selectionMode = false,
}: RestaurantCardProps) {
    const statusConfig = RESTAURANT_STATUS_CONFIG[restaurant.status] || RESTAURANT_STATUS_CONFIG.new;

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
                            onSelect?.(restaurant.id, checked as boolean)
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
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}
                            >
                                {statusConfig.label}
                            </span>
                            {restaurant.onboarding_stage && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400">
                                    {restaurant.onboarding_stage}
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-xl line-clamp-2 mb-2">
                            {restaurant.name}
                        </h3>
                    </div>
                    {/* Comment Notification */}
                    {(restaurant.comments_count || 0) > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-medium">
                                {restaurant.comments_count}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {restaurant.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {restaurant.description}
                    </p>
                )}

                {/* Details Grid */}
                <div className="text-sm space-y-1">
                    {/* City */}
                    {restaurant.city_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {restaurant.city_name}
                                {restaurant.city_state && `, ${restaurant.city_state}`}
                            </span>
                        </div>
                    )}

                    {/* Cuisine */}
                    {restaurant.cuisine_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UtensilsCrossed className="h-4 w-4 flex-shrink-0" />
                            <span>{restaurant.cuisine_name}</span>
                        </div>
                    )}

                    {/* BDR Target */}
                    {restaurant.bdr_target_per_week && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4 flex-shrink-0" />
                            <span>{restaurant.bdr_target_per_week} BDRs/week</span>
                        </div>
                    )}

                    {/* Assigned BDRs */}
                    {restaurant.assigned_bdrs && restaurant.assigned_bdrs.length > 0 && (
                        <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1.5">
                                {restaurant.assigned_bdrs.map((bdr) => (
                                    <span
                                        key={bdr.id}
                                        className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
                                    >
                                        {bdr.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Created date */}
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        Created {formatRelativeDate(restaurant.created_at)}
                    </p>
                </div>
            </div>
        </Card>
    );
}
