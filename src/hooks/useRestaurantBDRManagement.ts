import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface BDR {
    id: string;
    name: string;
    label: string;
}

export function useRestaurantBDRManagement() {
    const { toast } = useToast();
    const [bdrs, setBdrs] = useState<BDR[]>([]);
    const [bdrLoading, setBdrLoading] = useState(false);
    const [assigningBdr, setAssigningBdr] = useState(false);

    const loadBdrs = useCallback(async () => {
        setBdrLoading(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            // Get all users with BDR role
            const { data: bdrRoles, error: roleError } = await supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'BDR');

            if (roleError) {
                console.error("Error fetching BDR roles:", roleError);
                setBdrs([]);
                return;
            }

            if (!bdrRoles || bdrRoles.length === 0) {
                setBdrs([]);
                return;
            }

            // Get unique user IDs
            const userIds = [...new Set(bdrRoles.map((r: any) => r.user_id))];

            // Fetch profiles for these users
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('user_id, display_name')
                .in('user_id', userIds)
                .order('display_name');

            if (profileError) {
                console.error("Error fetching BDR profiles:", profileError);
                setBdrs([]);
                return;
            }

            // Map to the format expected by the UI
            const bdrList = profiles.map((profile: any) => ({
                id: profile.user_id,
                name: profile.display_name || 'Unknown BDR',
                label: profile.display_name || 'Unknown BDR'
            }));

            setBdrs(bdrList);
        } catch (error) {
            console.error("Error loading BDRs:", error);
            setBdrs([]);
        } finally {
            setBdrLoading(false);
        }
    }, []);

    const assignBdr = async (restaurantId: string, bdrId: string, onSuccess?: () => void) => {
        setAssigningBdr(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            // Use upsert to handle both insert and update
            const { error } = await supabase
                .from('restaurant_assignments')
                .upsert({
                    restaurant_id: restaurantId,
                    user_id: bdrId,
                    role: 'BDR',
                }, {
                    onConflict: 'restaurant_id,user_id'
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "BDR assigned successfully",
            });

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error assigning BDR:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to assign BDR",
                variant: "destructive",
            });
        } finally {
            setAssigningBdr(false);
        }
    };

    const unassignBdr = async (restaurantId: string, bdrId: string, onSuccess?: () => void) => {
        setAssigningBdr(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { error } = await supabase
                .from('restaurant_assignments')
                .delete()
                .eq('restaurant_id', restaurantId)
                .eq('user_id', bdrId)
                .eq('role', 'BDR');

            if (error) throw error;

            toast({
                title: "Success",
                description: "BDR unassigned successfully",
            });

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error unassigning BDR:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to unassign BDR",
                variant: "destructive",
            });
        } finally {
            setAssigningBdr(false);
        }
    };

    const updateBdrAssignment = async (
        restaurantId: string,
        currentBdrId: string | null,
        newBdrId: string | null,
        onSuccess?: () => void
    ) => {
        setAssigningBdr(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) throw new Error("Supabase client not initialized");

            // If same, do nothing
            if (currentBdrId === newBdrId) {
                setAssigningBdr(false);
                if (onSuccess) onSuccess();
                return;
            }

            // Remove old assignment if exists
            if (currentBdrId) {
                const { error: deleteError } = await supabase
                    .from('restaurant_assignments')
                    .delete()
                    .eq('restaurant_id', restaurantId)
                    .eq('user_id', currentBdrId)
                    .eq('role', 'BDR');

                if (deleteError) throw deleteError;
            }

            // Add new assignment if provided
            if (newBdrId) {
                const { error: insertError } = await supabase
                    .from('restaurant_assignments')
                    .insert({
                        restaurant_id: restaurantId,
                        user_id: newBdrId,
                        role: 'BDR',
                    });

                if (insertError) throw insertError;
            }

            const description = newBdrId
                ? (currentBdrId ? "BDR assignment updated successfully" : "BDR assigned successfully")
                : "BDR unassigned successfully";

            toast({
                title: "Success",
                description: description,
            });

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error updating BDR assignment:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update assignment",
                variant: "destructive",
            });
        } finally {
            setAssigningBdr(false);
        }
    };

    return {
        bdrs,
        bdrLoading,
        assigningBdr,
        loadBdrs,
        assignBdr,
        unassignBdr,
        updateBdrAssignment,
    };
}
