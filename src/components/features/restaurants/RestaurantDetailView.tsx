"use client";

import { useState, useEffect } from "react";
import { FileText, MapPin, UtensilsCrossed, UserCog, Calendar, TrendingUp, X, Trash2, Archive, Clock, Package, Utensils, Tag } from "lucide-react";
import { format } from "date-fns";
import { RESTAURANT_STATUS_CONFIG } from "./constants";
import { formatTime } from "./utils";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RestaurantDetailViewProps {
    restaurant: Restaurant;
    onRefresh?: () => Promise<void>;
    onClose?: () => void;
}

export function RestaurantDetailView({ restaurant, onRefresh, onClose }: RestaurantDetailViewProps) {
    const { isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const [bdrToUnassign, setBdrToUnassign] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<'archive' | 'permanent' | null>(null);
    const { unassignBDR, assigning } = useRestaurantAssignments(restaurant.id);
    const statusConfig = RESTAURANT_STATUS_CONFIG[restaurant.status] || RESTAURANT_STATUS_CONFIG.new;

    // Listen for archive/delete events from dropdown menu
    useEffect(() => {
        const handleArchive = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.id === restaurant.id) {
                setDeleteType('archive');
            }
        };

        const handleDelete = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.id === restaurant.id) {
                setDeleteType('permanent');
            }
        };

        window.addEventListener('archive-restaurant', handleArchive);
        window.addEventListener('delete-restaurant', handleDelete);

        return () => {
            window.removeEventListener('archive-restaurant', handleArchive);
            window.removeEventListener('delete-restaurant', handleDelete);
        };
    }, [restaurant.id]);

    const confirmUnassign = async () => {
        if (!bdrToUnassign) return;

        const success = await unassignBDR(bdrToUnassign);
        if (success) {
            if (onRefresh) await onRefresh();
            setBdrToUnassign(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteType) return;

        try {
            const { getSupabaseClient } = await import("@/lib/supabaseClient");
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`/api/restaurants/${restaurant.id}${deleteType === 'permanent' ? '?permanent=true' : ''}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Delete failed:", errorData);
                throw new Error(errorData.error || 'Failed to delete restaurant');
            }

            toast({
                title: deleteType === 'permanent' ? "Restaurant Deleted" : "Restaurant Archived",
                description: deleteType === 'permanent'
                    ? "The restaurant has been permanently deleted."
                    : "The restaurant has been moved to the archive.",
            });

            if (onClose) onClose();
            if (onRefresh) await onRefresh();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            toast({
                title: "Error",
                description: "Failed to delete restaurant. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteType(null);
        }
    };


    // Debug logging
    console.log('🔍 RestaurantDetailView received:', {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        hasDescription: !!restaurant.description,
        allKeys: Object.keys(restaurant)
    });

    return (
        <>
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
                <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>
                </div>
            )}

            {/* Location & Cuisine Section */}
            <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold border-b pb-2">Location & Cuisine</h3>
                <div className="space-y-2">
                    {/* Cuisines */}
                    {(restaurant.cuisine_name || restaurant.secondary_cuisine_name) && (
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">Cuisine:</span>
                            <span className="text-sm text-muted-foreground">
                                {restaurant.cuisine_name}
                                {restaurant.secondary_cuisine_name && (
                                    <span className="text-muted-foreground/70"> • {restaurant.secondary_cuisine_name}</span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* City */}
                    {restaurant.city_name && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">City:</span>
                            <span className="text-sm text-muted-foreground">
                                {restaurant.city_name}{restaurant.city_state && `, ${restaurant.city_state}`}
                            </span>
                        </div>
                    )}

                    {/* Earliest Pickup Time */}
                    {restaurant.earliest_pickup_time && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">Pickup:</span>
                            <span className="text-sm text-muted-foreground">
                                {formatTime(restaurant.earliest_pickup_time)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Operational Details Section */}
            {(restaurant.offers_box_meals || restaurant.offers_trays || restaurant.discount_percentage) && (
                <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold border-b pb-2">Operational Details</h3>
                    <div className="space-y-2">
                        {(restaurant.offers_box_meals || restaurant.offers_trays) && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Package className="h-4 w-4 flex-shrink-0" />
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
                        {restaurant.discount_percentage && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm font-semibold">Discount:</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {restaurant.discount_percentage}% off
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BDR Target Section */}
            {restaurant.bdr_target_per_week && (
                <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold border-b pb-2">BDR Target</h3>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">BDR Target:</span>
                        <span className="text-sm text-muted-foreground">
                            {restaurant.bdr_target_per_week} per week
                        </span>
                    </div>
                </div>
            )}

            {/* Primary Contact Section */}
            {restaurant.primary_contact && (
                <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold border-b pb-2">Primary Contact</h3>
                    <div className="space-y-1">
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
                </div>
            )}

            {/* Metadata Section */}
            <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold border-b pb-2">Metadata</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Status:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                            {statusConfig.icon && <statusConfig.icon className="h-3 w-3" />}
                            {statusConfig.label}
                        </span>
                    </div>
                    {restaurant.created_at && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">Created:</span>
                            <span>{format(new Date(restaurant.created_at), "PPP")}</span>
                        </div>
                    )}
                    {restaurant.updated_at && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">Updated:</span>
                            <span>{format(new Date(restaurant.updated_at), "PPP")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete/Archive Confirmation Dialog */}
            <AlertDialog open={!!deleteType} onOpenChange={(open) => !open && setDeleteType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteType === 'permanent' ? 'Delete Permanently?' : 'Archive Restaurant?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteType === 'permanent'
                                ? "This action cannot be undone. This will permanently delete the restaurant and all associated data."
                                : "This will move the restaurant to the archive. You can restore it later if needed."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={deleteType === 'permanent' ? "bg-destructive hover:bg-destructive/90" : "bg-orange-500 hover:bg-orange-600"}
                        >
                            {deleteType === 'permanent' ? 'Delete' : 'Archive'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
