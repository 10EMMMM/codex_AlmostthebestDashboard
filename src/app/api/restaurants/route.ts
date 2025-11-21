import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");

        // Create Supabase client with user's token
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        // Verify the user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch restaurants with related data
        const { data: restaurants, error } = await supabase
            .from("restaurants")
            .select(`
                *,
                cities(id, name, state_code),
                cuisines:primary_cuisine_id(id, name),
                restaurant_comments(id, deleted_at)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching restaurants:", error);
            return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
        }

        if (!restaurants || restaurants.length === 0) {
            return NextResponse.json({ restaurants: [] });
        }

        const restaurantIds = restaurants.map((r: any) => r.id);

        // Fetch primary contacts for all restaurants
        const { data: contacts } = await supabase
            .from("restaurant_contacts")
            .select("restaurant_id, full_name, email, phone")
            .in("restaurant_id", restaurantIds)
            .eq("is_primary", true);

        // Fetch BDR assignments
        const { data: assignments } = await supabase
            .from("restaurant_assignments")
            .select("restaurant_id, user_id")
            .in("restaurant_id", restaurantIds)
            .eq("role", "BDR");

        // Get unique BDR user IDs
        const bdrUserIds = [...new Set(assignments?.map((a: any) => a.user_id) || [])];

        // Fetch profiles for all BDRs
        const { data: bdrProfiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", bdrUserIds);

        // Create maps for quick lookup
        const contactMap = new Map();
        contacts?.forEach((contact: any) => {
            contactMap.set(contact.restaurant_id, contact);
        });

        const bdrProfileMap = new Map();
        bdrProfiles?.forEach((profile: any) => {
            bdrProfileMap.set(profile.user_id, profile);
        });

        const assignmentsMap = new Map<string, any[]>();
        assignments?.forEach((assignment: any) => {
            if (!assignmentsMap.has(assignment.restaurant_id)) {
                assignmentsMap.set(assignment.restaurant_id, []);
            }
            const profile = bdrProfileMap.get(assignment.user_id);
            assignmentsMap.get(assignment.restaurant_id)!.push({
                id: assignment.user_id,
                name: profile?.display_name || "Unknown BDR",
            });
        });

        // Format the response
        const formattedRestaurants = restaurants.map((restaurant: any) => {
            const contact = contactMap.get(restaurant.id);
            const assignedBdrs = assignmentsMap.get(restaurant.id) || [];
            const commentsCount = restaurant.restaurant_comments?.filter((c: any) => !c.deleted_at).length || 0;

            return {
                id: restaurant.id,
                name: restaurant.name,
                status: restaurant.status,
                city_id: restaurant.city_id,
                city_name: restaurant.cities?.name,
                city_state: restaurant.cities?.state_code,
                primary_cuisine_id: restaurant.primary_cuisine_id,
                cuisine_name: restaurant.cuisines?.name,
                onboarding_stage: restaurant.onboarding_stage,
                description: restaurant.description,
                bdr_target_per_week: restaurant.bdr_target_per_week,
                created_at: restaurant.created_at,
                updated_at: restaurant.updated_at,
                // Yelp-style fields
                price_range: restaurant.price_range,
                yelp_url: restaurant.yelp_url,
                average_rating: restaurant.average_rating,
                total_reviews: restaurant.total_reviews,
                primary_photo_url: restaurant.primary_photo_url,
                // Operational details
                discount_percentage: restaurant.discount_percentage,
                offers_box_meals: restaurant.offers_box_meals,
                offers_trays: restaurant.offers_trays,
                earliest_pickup_time: restaurant.earliest_pickup_time,
                // Relationships
                primary_contact: contact ? {
                    full_name: contact.full_name,
                    email: contact.email,
                    phone: contact.phone,
                } : null,
                assigned_bdrs: assignedBdrs,
                comments_count: commentsCount,
            };
        });

        return NextResponse.json({ restaurants: formattedRestaurants });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");

        // Create Supabase client
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        // Verify the user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const {
            name,
            city_id,
            primary_cuisine_id,
            description,
            bdr_target_per_week,
            contact,
            assigned_bdr_id,
        } = body;

        // Validate required fields
        if (!name || !city_id) {
            return NextResponse.json(
                { error: "Name and city are required" },
                { status: 400 }
            );
        }

        // Create restaurant
        const { data: restaurant, error: restaurantError } = await supabase
            .from("restaurants")
            .insert({
                name: name.trim(),
                city_id,
                primary_cuisine_id: primary_cuisine_id || null,
                description: description || null,
                bdr_target_per_week: bdr_target_per_week || 4,
                status: "new",
            })
            .select()
            .single();

        if (restaurantError) {
            console.error("Error creating restaurant:", restaurantError);
            return NextResponse.json(
                { error: "Failed to create restaurant" },
                { status: 500 }
            );
        }

        // Create primary contact if provided
        if (contact && (contact.full_name || contact.email || contact.phone)) {
            const { error: contactError } = await supabase
                .from("restaurant_contacts")
                .insert({
                    restaurant_id: restaurant.id,
                    full_name: contact.full_name || "Primary Contact",
                    email: contact.email || null,
                    phone: contact.phone || null,
                    is_primary: true,
                });

            if (contactError) {
                console.error("Error creating contact:", contactError);
            }
        }

        // Assign BDR if provided
        if (assigned_bdr_id) {
            const { error: assignmentError } = await supabase
                .from("restaurant_assignments")
                .insert({
                    restaurant_id: restaurant.id,
                    user_id: assigned_bdr_id,
                    role: "BDR",
                });

            if (assignmentError) {
                console.error("Error assigning BDR:", assignmentError);
            }
        }

        return NextResponse.json({ restaurant }, { status: 201 });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
