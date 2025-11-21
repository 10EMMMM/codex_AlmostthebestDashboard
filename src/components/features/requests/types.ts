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
