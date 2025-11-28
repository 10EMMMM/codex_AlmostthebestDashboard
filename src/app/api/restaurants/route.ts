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

        // Fetch cuisines for all restaurants
        const { data: restaurantCuisines } = await supabase
            .from("restaurant_cuisines")
            .select(`
                restaurant_id,
                cuisine_id,
                is_primary,
                display_order,
                cuisines (
                    id,
                    name
                )
            `)
            .in("restaurant_id", restaurantIds)
            .order("display_order", { ascending: true });

        // Get unique BDR user IDs and onboarded_by IDs
        const bdrUserIds = [...new Set([
            ...(assignments?.map((a: any) => a.user_id) || []),
            ...(restaurants.map((r: any) => r.onboarded_by).filter(Boolean) || []),
            ...(restaurants.map((r: any) => r.created_by).filter(Boolean) || [])
        ])];

        // Fetch profiles for all BDRs and onboarders
        const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", bdrUserIds);

        // Create maps for quick lookup
        const contactMap = new Map();
        contacts?.forEach((contact: any) => {
            contactMap.set(contact.restaurant_id, contact);
        });

        const profileMap = new Map();
        profiles?.forEach((profile: any) => {
            profileMap.set(profile.user_id, profile);
        });

        const assignmentsMap = new Map<string, any[]>();
        assignments?.forEach((assignment: any) => {
            if (!assignmentsMap.has(assignment.restaurant_id)) {
                assignmentsMap.set(assignment.restaurant_id, []);
            }
            const profile = profileMap.get(assignment.user_id);
            assignmentsMap.get(assignment.restaurant_id)!.push({
                id: assignment.user_id,
                name: profile?.display_name || "Unknown User",
            });
        });

        // Map cuisines to restaurants
        const cuisinesMap = new Map<string, any[]>();
        restaurantCuisines?.forEach((rc: any) => {
            if (!cuisinesMap.has(rc.restaurant_id)) {
                cuisinesMap.set(rc.restaurant_id, []);
            }
            cuisinesMap.get(rc.restaurant_id)!.push({
                id: rc.cuisine_id,
                name: rc.cuisines?.name || "Unknown",
                is_primary: rc.is_primary,
                display_order: rc.display_order
            });
        });

        // Format the response
        const formattedRestaurants = restaurants.map((restaurant: any) => {
            const contact = contactMap.get(restaurant.id);
            const assignedBdrs = assignmentsMap.get(restaurant.id) || [];
            const commentsCount = restaurant.restaurant_comments?.filter((c: any) => !c.deleted_at).length || 0;
            const onboarderProfile = restaurant.onboarded_by ? profileMap.get(restaurant.onboarded_by) : null;
            const creatorProfile = restaurant.created_by ? profileMap.get(restaurant.created_by) : null;
            const cuisines = cuisinesMap.get(restaurant.id) || [];
            const primaryCuisine = cuisines.find((c: any) => c.is_primary);
            const secondaryCuisines = cuisines.filter((c: any) => !c.is_primary);

            return {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                status: restaurant.status,
                description: restaurant.description,
                city_id: restaurant.city_id,
                city_name: restaurant.cities?.name,
                city_state: restaurant.cities?.state_code,
                primary_cuisine_id: restaurant.primary_cuisine_id,
                cuisine_name: primaryCuisine?.name,
                secondary_cuisine_name: secondaryCuisines.length > 0 ? secondaryCuisines[0].name : null,
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
                // User tracking
                onboarded_by: restaurant.onboarded_by,
                onboarded_by_name: onboarderProfile?.display_name,
                created_by: restaurant.created_by,
                created_by_name: creatorProfile?.display_name,
                created_at: restaurant.created_at,
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
                created_by: user.id,
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
