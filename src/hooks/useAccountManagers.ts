import { useState } from "react";
import type { AccountManager } from "@/components/features/requests/types";

/**
 * Custom hook for managing account manager data loading
 * 
 * @returns Object containing account managers array, loading state, and load function
 */
export function useAccountManagers() {
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
    const [amLoading, setAmLoading] = useState(false);

    const loadAccountManagers = async () => {
        setAmLoading(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) return;

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/admin/account-managers', {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAccountManagers(data.accountManagers || []);
            }
        } catch (error) {
            console.error('Error loading account managers:', error);
        } finally {
            setAmLoading(false);
        }
    };

    return {
        accountManagers,
        amLoading,
        loadAccountManagers,
    };
}
