// Shared type definitions for restaurant-related components

export interface Restaurant {
    id: string;
    name: string;
    slug?: string; // URL-friendly name
    status?: string; // 'new', 'on progress', 'done', 'on hold'
    description?: string; // Restaurant description
    city_id: string;
    city_name?: string;
    city_state?: string;
    pickup_street?: string;
    pickup_suite?: string;
    pickup_city?: string;
    pickup_state?: string;
    pickup_postal_code?: string;
    // Photo and ratings
    primary_photo_url?: string;
    average_rating?: number;
    total_reviews?: number;
    yelp_url?: string;
    // Cuisine fields
    cuisine_name?: string;
    secondary_cuisine_name?: string;
    // Operational fields
    earliest_pickup_time?: string;
    offers_box_meals?: boolean;
    offers_trays?: boolean;
    discount_percentage?: string;
    bdr_target_per_week?: number;
    // User tracking
    onboarded_by?: string;
    onboarded_by_name?: string;
    created_by?: string;
    created_by_name?: string;
    created_at?: string;
    // Enriched fields
    assigned_bdrs?: BDR[];
    primary_contact?: RestaurantContact;
    secondary_contacts?: RestaurantContact[]; // For viewing all contacts
    comments_count?: number;
    cuisines?: RestaurantCuisine[]; // Multiple cuisines support
}

// DEPRECATED: Status removed from schema
// export type RestaurantStatus = "new" | "on progress" | "on hold" | "done";

export interface RestaurantCuisine {
    id: string;
    restaurant_id: string;
    cuisine_id: string;
    cuisine_name?: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

export interface RestaurantContact {
    id: string;
    restaurant_id: string;
    full_name: string;
    email?: string;
    phone?: string;
    is_primary: boolean;
    created_at: string;
    // Note: Address fields removed - pickup address is now on restaurants table
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

// DEPRECATED: Photos and reviews removed from schema
// export interface RestaurantPhoto {
//     id: string;
//     restaurant_id: string;
//     url: string;
//     caption?: string;
//     category?: 'food' | 'interior' | 'exterior' | 'menu' | 'drink' | 'other';
//     uploaded_by?: string;
//     is_primary: boolean;
//     display_order: number;
//     created_at: string;
// }

// export interface RestaurantReview {
//     id: string;
//     restaurant_id: string;
//     user_id?: string;
//     rating: 1 | 2 | 3 | 4 | 5;
//     review_text?: string;
//     source: 'internal' | 'yelp' | 'google';
//     external_review_id?: string;
//     reviewer_name?: string;
//     created_at: string;
//     updated_at: string;
// }

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
    primary_cuisine_id: string; // Required
    description?: string;
    discount_percentage?: string;
    offers_box_meals?: boolean;
    offers_trays?: boolean;
    earliest_pickup_time?: string;
    pickup_street?: string;
    pickup_suite?: string;
    pickup_city?: string;
    pickup_state?: string;
    pickup_postal_code?: string;
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
    cityIds: string[];
    cuisineIds: string[];
    sortBy: 'created_at' | 'updated_at' | 'name' | 'city_name';
    sortDirection: 'asc' | 'desc';
    // REMOVED: statuses, onboardingStages (deprecated fields)
}

export interface TeamMember {
    id: string;
    display_name: string;
    avatar?: string;
    email?: string;
}
