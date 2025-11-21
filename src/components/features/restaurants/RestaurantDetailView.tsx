"use client";

import { useState } from "react";
import { FileText, MapPin, UtensilsCrossed, UserCog, Calendar, TrendingUp, X } from "lucide-react";
import { format } from "date-fns";
import { RESTAURANT_STATUS_CONFIG } from "./constants";
import type { Restaurant } from "./types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRestaurantComments } from "@/hooks/useRestaurantComments";
import { useRestaurantAssignments } from "@/hooks/useRestaurantAssignments";
import { RestaurantComments } from "./RestaurantComments";

interface RestaurantDetailViewProps {
    restaurant: Restaurant;
    onRefresh?: () => Promise<void>;
    onClose?: () => void;
}

export function RestaurantDetailView({ restaurant, onRefresh, onClose }: RestaurantDetailViewProps) {
    const [bdrToUnassign, setBdrToUnassign] = useState<string | null>(null);
    const { unassignBDR, assigning } = useRestaurantAssignments(restaurant.id);
    const statusConfig = RESTAURANT_STATUS_CONFIG[restaurant.status] || RESTAURANT_STATUS_CONFIG.new;

    const confirmUnassign = async () => {
        if (!bdrToUnassign) return;

        const success = await unassignBDR(bdrToUnassign);
        if (success) {
            if (onRefresh) await onRefresh();
            setBdrToUnassign(null);
        }
    };

    return (
        <>
            {/* Status and Stage Badges */}
            <div className="flex gap-2 items-center flex-wrap mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                </span>
                {restaurant.onboarding_stage && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400">
                        {restaurant.onboarding_stage}
                    </span>
                )}
                {restaurant.price_range && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                        {'$'.repeat(restaurant.price_range)}
                    </span>
                )}
            </div>

            {/* Primary Photo */}
            {restaurant.primary_photo_url && (
                <div className="mb-6">
                    <img
                        src={restaurant.primary_photo_url}
                        alt={restaurant.name}
                        className="w-full h-48 object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Yelp Rating & Link */}
            {(restaurant.average_rating || restaurant.yelp_url) && (
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    {/* Rating */}
                    {restaurant.average_rating && (
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{restaurant.average_rating.toFixed(1)}</span>
                            {restaurant.total_reviews && (
                                <span className="text-sm text-muted-foreground">
                                    ({restaurant.total_reviews} {restaurant.total_reviews === 1 ? 'review' : 'reviews'})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Yelp Link */}
                    {restaurant.yelp_url && (
                        <a
                            href={restaurant.yelp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                            View on Yelp
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                </div>
            )}

            {/* Description */}
            {restaurant.description && (
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                </div>
            )}

            {/* Details Section */}
            <div className="space-y-2">
                {/* City */}
                {restaurant.city_name && (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-semibold">City:</span>
                        <span className="text-sm text-muted-foreground">
                            {restaurant.city_name}{restaurant.city_state && `, ${restaurant.city_state}`}
                        </span>
                    </div>
                )}

                {/* Cuisine */}
                {restaurant.cuisine_name && (
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        <span className="text-sm font-semibold">Cuisine:</span>
                        <span className="text-sm text-muted-foreground">{restaurant.cuisine_name}</span>
                    </div>
                )}

                {/* Operational Details */}
                {(restaurant.discount_percentage || restaurant.earliest_pickup_time || restaurant.offers_box_meals || restaurant.offers_trays) && (
                    <div className="pt-2 border-t border-border/50">
                        <h4 className="text-sm font-semibold mb-2">Operational Details</h4>
                        <div className="space-y-1">
                            {restaurant.discount_percentage && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">Discount:</span>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        {restaurant.discount_percentage}% off
                                    </span>
                                </div>
                            )}
                            {restaurant.earliest_pickup_time && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">Earliest Pickup:</span>
                                    <span className="text-sm text-muted-foreground">
                                        {restaurant.earliest_pickup_time}
                                    </span>
                                </div>
                            )}
                            {(restaurant.offers_box_meals || restaurant.offers_trays) && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold">Offers:</span>
                                    <div className="flex gap-2">
                                        {restaurant.offers_box_meals && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                                Box Meals
                                            </span>
                                        )}
                                        {restaurant.offers_trays && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400">
                                                Trays/Catering
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BDR Target */}
                {restaurant.bdr_target_per_week && (
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">BDR Target:</span>
                        <span className="text-sm text-muted-foreground">
                            {restaurant.bdr_target_per_week} per week
                        </span>
                    </div>
                )}

                {/* Assigned BDR Badges */}
                <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span className="text-sm font-semibold">Assigned BDRs:</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {restaurant.assigned_bdrs && restaurant.assigned_bdrs.length > 0 ? (
                            restaurant.assigned_bdrs.map((bdr) => (
                                <span
                                    key={bdr.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 group relative pr-6"
                                >
                                    {bdr.name}
                                    <button
                                        onClick={() => setBdrToUnassign(bdr.id)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                                        title="Unassign BDR"
                                        disabled={assigning}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}
                    </div>
                </div>

                {/* Primary Contact */}
                {restaurant.primary_contact && (
                    <>
                        <Separator className="my-3" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold mb-2">Primary Contact</h4>
                            {restaurant.primary_contact.full_name && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Name:</span>
                                    <span className="text-muted-foreground">
                                        {restaurant.primary_contact.full_name}
                                    </span>
                                </div>
                            )}
                            {restaurant.primary_contact.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-muted-foreground">
                                        {restaurant.primary_contact.email}
                                    </span>
                                </div>
                            )}
                            {restaurant.primary_contact.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Phone:</span>
                                    <span className="text-muted-foreground">
                                        {restaurant.primary_contact.phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Footer Info */}
                <div className="pt-4 border-t"></div>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium text-foreground">Created:</span>
                        <span className="font-medium">
                            {format(new Date(restaurant.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <Separator className="my-6" />
            <RestaurantComments restaurantId={restaurant.id} onRefresh={onRefresh} />

            {/* Unassign Confirmation Dialog */}
            <AlertDialog open={!!bdrToUnassign} onOpenChange={(open) => !open && setBdrToUnassign(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unassign BDR?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unassign this BDR from the restaurant?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmUnassign}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Unassign
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
