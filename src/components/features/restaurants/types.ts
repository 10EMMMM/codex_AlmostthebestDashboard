// Shared type definitions for restaurant-related components

export interface Restaurant {
    id: string;
    name: string;
    status: RestaurantStatus;
    city_id: string;
    city_name?: string;
    city_state?: string;
    primary_cuisine_id?: string;
    cuisine_name?: string;
    onboarding_stage?: string;
    description?: string;
    bdr_target_per_week?: number;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
    // Yelp-style fields
    price_range?: 1 | 2 | 3 | 4;
    yelp_url?: string;
    average_rating?: number;
    total_reviews?: number;
    primary_photo_url?: string;
    // Operational details
    discount_percentage?: number;
    offers_box_meals?: boolean;
    offers_trays?: boolean;
    earliest_pickup_time?: string;
    // Enriched fields
    assigned_bdrs?: BDR[];
    primary_contact?: RestaurantContact;
    comments_count?: number;
    photos?: RestaurantPhoto[];
    reviews?: RestaurantReview[];
}

export type RestaurantStatus = "new" | "on progress" | "on hold" | "done";

export interface RestaurantContact {
    id: string;
    restaurant_id: string;
    full_name: string;
    email?: string;
    phone?: string;
    is_primary: boolean;
    created_at: string;
}

export interface RestaurantAssignment {
    id: string;
    restaurant_id: string;
    user_id: string;
    role: string;
    created_at: string;
}

export interface BDR {
    id: string;
    name: string;
    label?: string;
    avatar?: string;
}

export interface RestaurantPhoto {
    id: string;
    restaurant_id: string;
    url: string;
    caption?: string;
    category?: 'food' | 'interior' | 'exterior' | 'menu' | 'drink' | 'other';
    uploaded_by?: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

export interface RestaurantReview {
    id: string;
    restaurant_id: string;
    user_id?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    review_text?: string;
    source: 'internal' | 'yelp' | 'google';
    external_review_id?: string;
    reviewer_name?: string;
    created_at: string;
    updated_at: string;
}

export interface Cuisine {
    id: string;
    name: string;
}

export interface RestaurantComment {
    id: string;
    restaurant_id: string;
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
    mentions: RestaurantCommentMention[];
    reactions: RestaurantCommentReaction[];
    replies?: RestaurantComment[];
}

export interface RestaurantCommentMention {
    id: string;
    comment_id: string;
    mentioned_user_id: string;
    mentioned_user_name: string;
}

export interface RestaurantCommentReaction {
    id: string;
    comment_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

export interface CreateRestaurantData {
    name: string;
    city_id: string;
    primary_cuisine_id?: string;
    description?: string;
    bdr_target_per_week?: number;
    contact?: {
        full_name: string;
        email?: string;
        phone?: string;
    };
    assigned_bdr_id?: string;
}

export interface CreateRestaurantCommentData {
    restaurant_id: string;
    content: string;
    parent_comment_id?: string;
    mentions: string[]; // user IDs
}

export interface RestaurantFilters {
    search: string;
    statuses: RestaurantStatus[];
    onboardingStages: string[];
    cityIds: string[];
    cuisineIds: string[];
    sortBy: 'created_at' | 'updated_at' | 'name' | 'bdr_target_per_week' | 'status' | 'city_name';
    sortDirection: 'asc' | 'desc';
}

export interface TeamMember {
    id: string;
    display_name: string;
    avatar?: string;
    email?: string;
}
