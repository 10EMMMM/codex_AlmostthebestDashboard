import { useState, useEffect, useCallback } from "react";
import type { TeamMember } from "@/components/features/requests/types";

/**
 * Custom hook for fetching and searching team members
 * Used for @mention autocomplete
 */
export function useTeamMembers() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Load all team members from the database
     */
    const loadTeamMembers = useCallback(async () => {
        setLoading(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

            // Fetch all profiles
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url')
                .order('display_name');

            if (error) {
                console.error("Error fetching team members:", error);
                setTeamMembers([]);
                return;
            }

            // Transform to TeamMember format
            const members: TeamMember[] = profiles.map((profile: any) => ({
                id: profile.user_id,
                display_name: profile.display_name || 'Unknown User',
                avatar: profile.avatar_url,
            }));

            setTeamMembers(members);
        } catch (error) {
            console.error("Error loading team members:", error);
            setTeamMembers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Search team members by name or email
     */
    const searchMembers = useCallback((query: string): TeamMember[] => {
        if (!query) return teamMembers;

        const lowerQuery = query.toLowerCase();
        return teamMembers.filter(member =>
            member.display_name.toLowerCase().includes(lowerQuery) ||
            (member.email && member.email.toLowerCase().includes(lowerQuery))
        );
    }, [teamMembers]);

    /**
     * Get a team member by ID
     */
    const getMemberById = useCallback((id: string): TeamMember | undefined => {
        return teamMembers.find(member => member.id === id);
    }, [teamMembers]);

    // Load team members on mount
    useEffect(() => {
        loadTeamMembers();
    }, [loadTeamMembers]);

    return {
        teamMembers,
        loading,
        loadTeamMembers,
        searchMembers,
        getMemberById,
    };
}
