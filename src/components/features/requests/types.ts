// Shared type definitions for request-related components

export interface Request {
    id: string;
    title: string;
    description?: string;
    request_type: string;
    status: string;
    city_id: string;
    city_name?: string;
    city_state?: string;
    requester_id: string;
    requester_name?: string;
    creator_name?: string;
    company?: string;
    volume?: number;
    need_answer_by?: string;
    delivery_date?: string;
    created_at: string;
    created_on_behalf?: boolean;
    assigned_bdrs?: BDR[];
    assigned_bdr_id?: string;
    assigned_bdr_avatar?: string;
    assigned_bdr_name?: string;
    comments_count?: number;
}

export interface BDR {
    id: string;
    name: string;
    label?: string;
    avatar?: string;
}

export interface City {
    id: string;
    name: string;
    state_code: string;
}

export interface AccountManager {
    id: string;
    email: string;
    display_name: string;
    city_count: number;
}

export interface EditFormData {
    selectedAM: string;
    cityId: string;
    title: string;
    description: string;
    request_type: string;
    volume: number | undefined;
    need_answer_by: Date | undefined;
    delivery_date: Date | undefined;
    company: string;
}

export interface RequestFilters {
    search: string;
    types: string[];
    statuses: string[];
    dateFrom?: Date;
    dateTo?: Date;
    sortBy: 'created_at' | 'updated_at' | 'title' | 'company' | 'volume';
    sortDirection: 'asc' | 'desc';
}

// Comment-related types
export interface Comment {
    id: string;
    request_id: string;
    user_id: string | null;
    parent_comment_id?: string;
    content: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    is_edited: boolean;
    // Joined data
    user_name: string;
    user_avatar?: string;
    mentions: CommentMention[];
    reactions: CommentReaction[];
    replies?: Comment[];
}

export interface CommentMention {
    id: string;
    comment_id: string;
    mentioned_user_id: string;
    mentioned_user_name: string;
}

export interface CommentReaction {
    id: string;
    comment_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

export interface CreateCommentData {
    request_id: string;
    content: string;
    parent_comment_id?: string;
    mentions: string[]; // user IDs
}

export interface TeamMember {
    id: string;
    display_name: string;
    avatar?: string;
    email?: string;
}
