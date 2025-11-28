"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import type { Restaurant } from "./types";
import { cn } from "@/lib/utils";
import {
    MapPin,
    UtensilsCrossed,
    Clock,
    Package,
    Utensils,
    Tag,
    UserCog,
    X,
} from "lucide-react";
import { formatTime } from "./utils";

interface ExpandableRestaurantListProps {
    restaurants: Restaurant[];
    onRestaurantClick?: (restaurant: Restaurant) => void;
}

export function ExpandableRestaurantList({
    restaurants,
    onRestaurantClick,
}: ExpandableRestaurantListProps) {
    const [active, setActive] = useState<Restaurant | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-10"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active ? (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.id}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white dark:bg-neutral-800 rounded-full h-6 w-6 z-50"
                            onClick={() => setActive(null)}
                        >
                            <X className="h-4 w-4 text-black dark:text-white" />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.id}-${id}`}
                            ref={ref}
                            className="w-full max-w-[600px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* Restaurant Image Header */}
                            <motion.div layoutId={`image-${active.id}-${id}`}>
                                <div className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <div className="text-6xl font-bold text-primary/30">
                                        {active.name.charAt(0)}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Expanded Card Content */}
                            <div>
                                <div className="flex justify-between items-start p-4">
                                    <div>
                                        <motion.h3
                                            layoutId={`title-${active.id}-${id}`}
                                            className="font-bold text-neutral-700 dark:text-neutral-200"
                                        >
                                            {active.name}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.id}-${id}`}
                                            className="text-neutral-600 dark:text-neutral-400"
                                        >
                                            {active.city_name && `${active.city_name}${active.city_state ? `, ${active.city_state}` : ''}`}
                                        </motion.p>
                                    </div>

                                    <motion.button
                                        layoutId={`button-${active.id}-${id}`}
                                        onClick={() => {
                                            onRestaurantClick?.(active);
                                            setActive(null);
                                        }}
                                        className="px-4 py-3 text-sm rounded-full font-bold bg-primary hover:opacity-90 text-primary-foreground"
                                    >
                                        View Details
                                    </motion.button>
                                </div>

                                <div className="pt-4 relative px-4">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                                    >
                                        {/* Details */}
                                        <div className="space-y-3 w-full">
                                            {/* Rating & Price */}
                                            <div className="flex items-center gap-3">
                                                {active.price_range && (
                                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {"$".repeat(active.price_range)}
                                                    </span>
                                                )}
                                                {active.average_rating && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500">★</span>
                                                        <span className="font-medium">{active.average_rating.toFixed(1)}</span>
                                                        {active.total_reviews && (
                                                            <span className="text-sm text-muted-foreground">
                                                                ({active.total_reviews})
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cuisine */}
                                            {(active.cuisine_name || active.secondary_cuisine_name) && (
                                                <div className="flex items-center gap-2">
                                                    <UtensilsCrossed className="h-4 w-4 flex-shrink-0" />
                                                    <span>
                                                        {active.cuisine_name}
                                                        {active.secondary_cuisine_name && (
                                                            <span className="text-muted-foreground/70"> • {active.secondary_cuisine_name}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Pickup Time */}
                                            {active.earliest_pickup_time && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                                    <span>
                                                        <span className="font-medium">Pickup:</span> {formatTime(active.earliest_pickup_time)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            {(active.offers_box_meals || active.offers_trays || active.discount_percentage) && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {active.offers_box_meals && (
                                                        <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                                                            <Package className="h-3 w-3" />
                                                            <span>Box Meals</span>
                                                        </div>
                                                    )}
                                                    {active.offers_trays && (
                                                        <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
                                                            <Utensils className="h-3 w-3" />
                                                            <span>Trays</span>
                                                        </div>
                                                    )}
                                                    {active.discount_percentage && (
                                                        <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                                                            <Tag className="h-3 w-3" />
                                                            <span>{active.discount_percentage}% Off</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Onboarded by */}
                                            {active.onboarded_by && (
                                                <div className="pt-3 border-t border-border/50">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <UserCog className="h-3 w-3" />
                                                        <span>
                                                            <span className="font-medium">Onboarded by:</span> {active.onboarded_by_name || active.onboarded_by}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>

            {/* List Layout */}
            <ul className="max-w-4xl mx-auto w-full gap-4">
                {restaurants.map((restaurant) => (
                    <motion.div
                        layoutId={`card-${restaurant.id}-${id}`}
                        key={`card-${restaurant.id}-${id}`}
                        onClick={() => setActive(restaurant)}
                        className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl cursor-pointer bg-card border border-border mb-4 shadow-sm transition-all"
                    >
                        <div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
                            {/* Restaurant Icon/Image */}
                            <motion.div layoutId={`image-${restaurant.id}-${id}`}>
                                <div className="h-40 w-40 md:h-14 md:w-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl md:text-xl font-bold text-primary/50">
                                        {restaurant.name.charAt(0)}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Restaurant Info */}
                            <div className="flex-1">
                                <motion.h3
                                    layoutId={`title-${restaurant.id}-${id}`}
                                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                                >
                                    {restaurant.name}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${restaurant.id}-${id}`}
                                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-sm"
                                >
                                    {restaurant.city_name && `${restaurant.city_name}${restaurant.city_state ? `, ${restaurant.city_state}` : ''}`}
                                </motion.p>

                                {/* Quick badges */}
                                <div className="flex items-center gap-2 mt-1 justify-center md:justify-start flex-wrap">
                                    {restaurant.price_range && (
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                            {"$".repeat(restaurant.price_range)}
                                        </span>
                                    )}
                                    {restaurant.average_rating && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500 text-xs">★</span>
                                            <span className="text-xs font-medium">{restaurant.average_rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {restaurant.cuisine_name && (
                                        <span className="text-xs text-muted-foreground">• {restaurant.cuisine_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                            layoutId={`button-${restaurant.id}-${id}`}
                            className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-primary hover:text-primary-foreground text-black dark:bg-neutral-700 dark:text-white dark:hover:bg-primary mt-4 md:mt-0 transition-colors"
                        >
                            View
                        </motion.button>
                    </motion.div>
                ))}
            </ul>
        </>
    );
}
