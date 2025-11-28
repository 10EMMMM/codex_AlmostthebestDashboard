import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    MapPin,
    UserCog,
    MessageSquare,
    UtensilsCrossed,
    Tag,
    Package,
    Utensils,
    Clock,
} from "lucide-react";
import type { Restaurant } from "@/components/features/restaurants/types";
import { formatRelativeDate, formatTime } from "@/components/features/restaurants/utils";

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
                        <h3 className="font-semibold text-xl line-clamp-2 mb-2">
                            {restaurant.name}
                        </h3>
                        {/* Yelp-style info */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {restaurant.price_range && (
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {'$'.repeat(restaurant.price_range)}
                                </span>
                            )}
                            {restaurant.average_rating && (
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-sm">★</span>
                                    <span className="text-sm font-medium">{restaurant.average_rating.toFixed(1)}</span>
                                    {restaurant.total_reviews && (
                                        <span className="text-xs text-muted-foreground">
                                            ({restaurant.total_reviews})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
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

                {/* Details Grid */}
                <div className="text-sm space-y-1">
                    {/* Cuisines */}
                    {(restaurant.cuisine_name || restaurant.secondary_cuisine_name) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UtensilsCrossed className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {restaurant.cuisine_name}
                                {restaurant.secondary_cuisine_name && (
                                    <span className="text-muted-foreground/70"> • {restaurant.secondary_cuisine_name}</span>
                                )}
                            </span>
                        </div>
                    )}

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

                    {/* Earliest Pickup Time */}
                    {restaurant.earliest_pickup_time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                                <span className="font-medium">Pickup:</span> {formatTime(restaurant.earliest_pickup_time)}
                            </span>
                        </div>
                    )}

                    {/* Operational Details Badges */}
                    {(restaurant.offers_box_meals || restaurant.offers_trays || restaurant.discount_percentage) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {restaurant.offers_box_meals && (
                                <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                                    <Package className="h-3 w-3" />
                                    <span>Box Meals</span>
                                </div>
                            )}
                            {restaurant.offers_trays && (
                                <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
                                    <Utensils className="h-3 w-3" />
                                    <span>Trays</span>
                                </div>
                            )}
                            {restaurant.discount_percentage && (
                                <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                                    <Tag className="h-3 w-3" />
                                    <span>{restaurant.discount_percentage}% Off</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Onboarded by */}
                {restaurant.onboarded_by && (
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserCog className="h-3 w-3" />
                            <span>
                                <span className="font-medium">Onboarded by:</span> {restaurant.onboarded_by_name || restaurant.onboarded_by}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
