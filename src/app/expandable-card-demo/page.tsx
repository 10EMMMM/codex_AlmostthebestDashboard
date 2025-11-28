"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ExpandableRestaurantDemo } from "@/components/features/restaurants/ExpandableRestaurantDemo";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurants } from "@/hooks/useRestaurants";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import type { RestaurantFilters } from "@/components/features/restaurants/types";

export default function ExpandableCardDemoPage() {
    const { user, loading: authLoading } = useAuth();

    // Filters
    const [filters] = useState<RestaurantFilters>({
        search: "",
        cityIds: [],
        cuisineIds: [],
        sortBy: "created_at",
        sortDirection: "desc",
    });

    // Custom hooks
    const { restaurants, loading, loadRestaurants, filteredRestaurants } = useRestaurants(filters);

    // Load restaurants on mount
    useEffect(() => {
        if (user) {
            loadRestaurants();
        }
    }, [user]);

    if (authLoading) return <SplashScreen />;
    if (!user)
        return (
            <ErrorSplashScreen
                message="Please log in"
                actionText="Go to Login"
                onActionClick={() => (window.location.href = "/")}
            />
        );

    return (
        <>
            {/* Page wordmark */}
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Expandable Card Demo
            </div>
            <DashboardLayout title="">
                {/* Viewport wrapper with scaling */}
                <div className="relative w-full h-full z-10">
                    <div
                        className="relative z-10 w-full h-full"
                        style={{ transform: "scale(0.9)", transformOrigin: "top center" }}
                    >
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[1600px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Expandable Card Demo</h1>
                                    <p className="text-muted-foreground">
                                        Click on any restaurant card to see the smooth expansion animation. Press ESC or click outside to close.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Demo Component with Real Data */}
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <ExpandableRestaurantDemo restaurants={filteredRestaurants} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
