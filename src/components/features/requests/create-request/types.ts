import { UtensilsCrossed, PartyPopper, ChefHat } from "lucide-react";

export type City = {
    id: string;
    name: string;
    state_code: string;
};

export type AccountManager = {
    id: string;
    email: string;
    display_name: string;
    city_count: number;
};

export const REQUEST_TYPES = ["RESTAURANT", "EVENT", "CUISINE"] as const;

export const REQUEST_TYPE_CONFIG = {
    RESTAURANT: {
        icon: UtensilsCrossed,
        example: "New Italian restaurant in Downtown Miami",
    },
    EVENT: {
        icon: PartyPopper,
        example: "Corporate holiday party for 100 guests",
    },
    CUISINE: {
        icon: ChefHat,
        example: "Authentic Thai cuisine for catering menu",
    },
} as const;

export type CreateRequestFormData = {
    selectedAM: string;
    requestType: string;
    title: string;
    description: string;
    cityId: string;
    volume?: number;
    need_answer_by?: Date;
    delivery_date?: Date;
    company?: string;
};
