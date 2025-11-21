import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BDR, Request } from "@/components/features/requests/types";

/**
 * Custom hook for managing BDR assignment operations
 * 
 * @param selectedRequest - The currently selected request
 * @param onAssignmentChange - Callback to refresh requests after assignment changes
 * @returns Object containing BDR data, loading states, and assignment functions
 */
export function useBdrAssignment(
    selectedRequest: Request | null,
    onAssignmentChange: () => Promise<void>
) {
    const { toast } = useToast();
    const [bdrs, setBdrs] = useState<BDR[]>([]);
    const [bdrLoading, setBdrLoading] = useState(false);
    const [assigningBdr, setAssigningBdr] = useState(false);

    const loadBdrs = async () => {
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
            const userIds = [...new Set(bdrRoles.map((r: { user_id: string }) => r.user_id))];

            // Fetch profiles for these users
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('user_id, display_name')
                .in('user_id', userIds);

            if (profileError) {
                console.error("Error fetching BDR profiles:", profileError);
                setBdrs([]);
                return;
            }

            // Map to the format expected by the UI
            const bdrList = profiles.map((profile: { user_id: string; display_name: string }) => ({
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
    };

    const assignBdr = async (bdrId: string) => {
        if (!selectedRequest) return;

        setAssigningBdr(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`/api/admin/assign-bdr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequest.id,
                    bdr_id: bdrId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to assign BDR');
            }

            toast({
                title: "Success",
                description: "BDR assigned successfully",
            });

            // Reload the requests to get updated assignments
            await onAssignmentChange();
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

    const unassignBdr = async (bdrId: string) => {
        if (!selectedRequest) return;

        setAssigningBdr(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`/api/admin/unassign-bdr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequest.id,
                    bdr_id: bdrId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unassign BDR');
            }

            toast({
                title: "Success",
                description: "BDR unassigned successfully",
            });

            // Reload the requests to get updated assignments
            await onAssignmentChange();
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

    return {
        bdrs,
        bdrLoading,
        assigningBdr,
        loadBdrs,
        assignBdr,
        unassignBdr,
    };
}
