import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing BDR assignments for restaurants
 */
export function useRestaurantAssignments(restaurantId: string) {
    const { toast } = useToast();
    const [assigning, setAssigning] = useState(false);

    /**
     * Assign a BDR to the restaurant
     */
    const assignBDR = useCallback(async (bdrId: string) => {
        setAssigning(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/restaurants/${restaurantId}/assign-bdr`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ bdrId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to assign BDR");
            }

            toast({
                title: "Success",
                description: "BDR assigned successfully",
                variant: "success",
            });

            return true;
        } catch (error: any) {
            console.error("Error assigning BDR:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to assign BDR",
                variant: "destructive",
            });
            return false;
        } finally {
            setAssigning(false);
        }
    }, [restaurantId, toast]);

    /**
     * Unassign a BDR from the restaurant
     */
    const unassignBDR = useCallback(async (bdrId: string) => {
        setAssigning(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/restaurants/${restaurantId}/unassign-bdr`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ bdrId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to unassign BDR");
            }

            toast({
                title: "Success",
                description: "BDR unassigned successfully",
                variant: "success",
            });

            return true;
        } catch (error: any) {
            console.error("Error unassigning BDR:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to unassign BDR",
                variant: "destructive",
            });
            return false;
        } finally {
            setAssigning(false);
        }
    }, [restaurantId, toast]);

    return {
        assigning,
        assignBDR,
        unassignBDR,
    };
}
