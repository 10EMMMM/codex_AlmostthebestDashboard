"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RestaurantFilterBar } from "@/components/features/restaurants/RestaurantFilterBar";
import { RestaurantList } from "@/components/features/restaurants/RestaurantList";
import { CreateRestaurantModal } from "@/components/features/restaurants/CreateRestaurantModal";
import { RestaurantDetailView } from "@/components/features/restaurants/RestaurantDetailView";
import { RestaurantEditForm } from "@/components/features/restaurants/RestaurantEditForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Edit2, MoreHorizontal, RefreshCw } from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import type { Restaurant, RestaurantFilters } from "@/components/features/restaurants/types";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function RestaurantOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<Set<string>>(new Set());

  // Filters
  const [filters, setFilters] = useState<RestaurantFilters>({
    search: "",
    statuses: [],
    onboardingStages: [],
    cityIds: [],
    cuisineIds: [],
    sortBy: "created_at",
    sortDirection: "desc",
  });

  // Custom hooks
  const { restaurants, loading, loadRestaurants, filteredRestaurants } = useRestaurants(filters);

  // Supabase client - use authenticated browser client
  const [supabase] = useState(() => getSupabaseClient());

  // Load restaurants on mount
  useEffect(() => {
    if (user) {
      loadRestaurants();
    }
  }, [user]);

  // Handle restaurant click
  const handleRestaurantClick = (restaurant: Restaurant) => {
    if (selectionMode) return; // Don't open detail in selection mode
    setSelectedRestaurant(restaurant);
    setShowDetailSheet(true);
    setIsEditing(false);
  };

  // Handle close detail sheet
  const handleCloseDetailSheet = () => {
    setShowDetailSheet(false);
    setIsEditing(false);
    setTimeout(() => setSelectedRestaurant(null), 300);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await loadRestaurants();
    // Update selected restaurant if detail sheet is open
    if (selectedRestaurant) {
      const updated = restaurants.find((r) => r.id === selectedRestaurant.id);
      if (updated) {
        setSelectedRestaurant(updated);
      }
    }
  };

  // Handle edit save
  const handleEditSave = async () => {
    await handleRefresh();
    setIsEditing(false);
  };

  // Handle selection
  const handleSelectRestaurant = (id: string, selected: boolean) => {
    setSelectedRestaurantIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // Handle selection mode change
  const handleSelectionModeChange = (enabled: boolean) => {
    setSelectionMode(enabled);
    if (!enabled) {
      setSelectedRestaurantIds(new Set());
    }
  };

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
        Restaurant Onboarding
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
                {/* Filter Bar */}
                <div className="mb-6">
                  <RestaurantFilterBar
                    onFilterChange={setFilters}
                    activeFilters={filters}
                    selectionMode={selectionMode}
                    onSelectionModeChange={handleSelectionModeChange}
                    onCreateRestaurant={() => setShowCreateModal(true)}
                  />
                </div>

                {/* Restaurant List */}
                <RestaurantList
                  restaurants={filteredRestaurants}
                  loading={loading}
                  onRestaurantClick={handleRestaurantClick}
                  selectedRestaurantIds={selectedRestaurantIds}
                  onSelectRestaurant={handleSelectRestaurant}
                  selectionMode={selectionMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Create Restaurant Modal */}
        <CreateRestaurantModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreated={handleRefresh}
          supabase={supabase}
        />

        {/* Restaurant Detail Sheet */}
        <Sheet open={showDetailSheet} onOpenChange={handleCloseDetailSheet}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-2xl font-bold mb-1">
                    {selectedRestaurant?.name}
                  </SheetTitle>
                  <SheetDescription>
                    Restaurant onboarding details
                  </SheetDescription>
                </div>
                {selectedRestaurant && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </SheetHeader>

            <div className="mt-6">
              {selectedRestaurant && (
                <>
                  {isEditing ? (
                    <RestaurantEditForm
                      restaurant={selectedRestaurant}
                      onSave={handleEditSave}
                      onCancel={() => setIsEditing(false)}
                      supabase={supabase}
                    />
                  ) : (
                    <RestaurantDetailView
                      restaurant={selectedRestaurant}
                      onRefresh={handleRefresh}
                      onClose={handleCloseDetailSheet}
                    />
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </DashboardLayout>
    </>
  );
}
