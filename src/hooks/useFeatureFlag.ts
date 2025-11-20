import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to check if a feature flag is enabled for the current user
 * @param flagName - The name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(flagName: string): boolean {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user, isSuperAdmin } = useAuth();

    useEffect(() => {
        if (!user) {
            setIsEnabled(false);
            setLoading(false);
            return;
        }

        // Super admins always have access to all features
        if (isSuperAdmin) {
            setIsEnabled(true);
            setLoading(false);
            return;
        }

        const checkFeatureFlag = async () => {
            try {
                const supabase = (window as any).supabase;
                if (!supabase) {
                    setIsEnabled(false);
                    setLoading(false);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch(
                    `/api/feature-flags/${flagName}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.access_token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setIsEnabled(data.isEnabled || false);
                } else {
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error(`Error checking feature flag ${flagName}:`, error);
                setIsEnabled(false);
            } finally {
                setLoading(false);
            }
        };

        checkFeatureFlag();
    }, [user, isSuperAdmin, flagName]);

    return isEnabled;
}
