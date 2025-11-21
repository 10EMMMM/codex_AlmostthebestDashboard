import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";
import type { Restaurant } from "./types";

interface RestaurantListProps {
    restaurants: Restaurant[];
    loading?: boolean;
    onRestaurantClick: (restaurant: Restaurant) => void;
    // Selection props
    selectedRestaurantIds?: Set<string>;
    onSelectRestaurant?: (id: string, selected: boolean) => void;
    selectionMode?: boolean;
}

export function RestaurantList({
    restaurants,
    loading = false,
    onRestaurantClick,
    selectedRestaurantIds = new Set(),
    onSelectRestaurant,
    selectionMode = false,
}: RestaurantListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <RestaurantCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <svg
                        className="h-12 w-12 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground max-w-md">
                    Try adjusting your filters or create a new restaurant to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
                <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => onRestaurantClick(restaurant)}
                    isSelected={selectedRestaurantIds.has(restaurant.id)}
                    onSelect={onSelectRestaurant}
                    selectionMode={selectionMode}
                />
            ))}
        </div>
    );
}
