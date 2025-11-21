import { useState, useMemo } from 'react';
import type { Request, RequestFilters } from '@/components/features/requests/types';

export function useRequestFilters(requests: Request[]) {
    const [filters, setFilters] = useState<RequestFilters>({
        search: '',
        types: [],
        statuses: [],
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'created_at',
        sortDirection: 'desc',
    });

    const filteredRequests = useMemo(() => {
        // 1. Apply filters
        let result = requests.filter(request => {
            // Text search (title, company, requester)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    request.title.toLowerCase().includes(searchLower) ||
                    request.company?.toLowerCase().includes(searchLower) ||
                    request.requester_name?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Type filter
            if (filters.types.length > 0) {
                if (!filters.types.includes(request.request_type)) return false;
            }

            // Status filter
            if (filters.statuses.length > 0) {
                if (!filters.statuses.includes(request.status)) return false;
            }

            // Date range filter
            if (filters.dateFrom) {
                if (new Date(request.created_at) < filters.dateFrom) return false;
            }
            if (filters.dateTo) {
                if (new Date(request.created_at) > filters.dateTo) return false;
            }

            return true;
        });

        // 2. Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'updated_at':
                    // Fallback to created_at if updated_at doesn't exist
                    const aUpdated = (a as any).updated_at || a.created_at;
                    const bUpdated = (b as any).updated_at || b.created_at;
                    comparison = new Date(aUpdated).getTime() - new Date(bUpdated).getTime();
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'company':
                    comparison = (a.company || '').localeCompare(b.company || '');
                    break;
                case 'volume':
                    comparison = (a.volume || 0) - (b.volume || 0);
                    break;
            }

            return filters.sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [requests, filters]);

    return {
        filters,
        setFilters,
        filteredRequests,
    };
}
