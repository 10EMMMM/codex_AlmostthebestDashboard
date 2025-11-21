import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Request } from "@/components/features/requests/types";

/**
 * Custom hook for managing request data fetching and state
 * 
 * @returns Object containing requests array, loading state, and fetch function
 */
export function useRequests() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/requests", {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch requests");

            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        requests,
        loading,
        loadRequests,
        refreshRequests: loadRequests, // Alias for clarity
    };
}
