import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/restaurant-reports
 * Generate a detailed report for restaurants
 * Query params: restaurantIds (comma-separated)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantIdsParam = searchParams.get("restaurantIds");

        if (!restaurantIdsParam) {
            return NextResponse.json(
                { error: "Restaurant IDs are required" },
                { status: 400 }
            );
        }

        const restaurantIds = restaurantIdsParam.split(",");

        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify User
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json(
                { error: "Invalid authentication" },
                { status: 401 }
            );
        }

        // Fetch restaurants with full details
        const { data: restaurants, error: restaurantsError } = await supabase
            .from("restaurants")
            .select(`
                *,
                cities(id, name, state_code),
                cuisines:primary_cuisine_id(id, name)
            `)
            .in("id", restaurantIds)
            .is("deleted_at", null);

        if (restaurantsError) {
            console.error("Error fetching restaurants:", restaurantsError);
            return NextResponse.json(
                { error: "Failed to fetch restaurants" },
                { status: 500 }
            );
        }

        // Fetch contacts
        const { data: contacts } = await supabase
            .from("restaurant_contacts")
            .select("*")
            .in("restaurant_id", restaurantIds);

        // Fetch assignments
        const { data: assignments } = await supabase
            .from("restaurant_assignments")
            .select("restaurant_id, user_id")
            .in("restaurant_id", restaurantIds)
            .eq("role", "BDR");

        // Get BDR profiles
        const bdrUserIds = [...new Set(assignments?.map((a: any) => a.user_id) || [])];
        const { data: bdrProfiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, email")
            .in("user_id", bdrUserIds);

        // Fetch comments
        const { data: comments } = await supabase
            .from("restaurant_comments")
            .select(`
                *,
                profiles:user_id (
                    display_name
                ),
                restaurant_comment_mentions (
                    id,
                    mentioned_user_id,
                    profiles:mentioned_user_id (
                        display_name
                    )
                )
            `)
            .in("restaurant_id", restaurantIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        // Create lookup maps
        const contactMap = new Map();
        contacts?.forEach((contact: any) => {
            if (!contactMap.has(contact.restaurant_id)) {
                contactMap.set(contact.restaurant_id, []);
            }
            contactMap.get(contact.restaurant_id).push(contact);
        });

        const bdrProfileMap = new Map();
        bdrProfiles?.forEach((profile: any) => {
            bdrProfileMap.set(profile.user_id, profile);
        });

        const assignmentsMap = new Map();
        assignments?.forEach((assignment: any) => {
            if (!assignmentsMap.has(assignment.restaurant_id)) {
                assignmentsMap.set(assignment.restaurant_id, []);
            }
            const profile = bdrProfileMap.get(assignment.user_id);
            assignmentsMap.get(assignment.restaurant_id).push({
                id: assignment.user_id,
                name: profile?.display_name || "Unknown BDR",
                email: profile?.email,
            });
        });

        const commentsMap = new Map();
        comments?.forEach((comment: any) => {
            if (!commentsMap.has(comment.restaurant_id)) {
                commentsMap.set(comment.restaurant_id, []);
            }

            // Build threaded structure for this comment
            const transformedComment = {
                id: comment.id,
                user_name: comment.profiles?.display_name || "Unknown User",
                content: comment.content,
                created_at: comment.created_at,
                is_edited: comment.is_edited,
                parent_comment_id: comment.parent_comment_id,
                mentions: comment.restaurant_comment_mentions.map((m: any) => ({
                    mentioned_user_name: m.profiles?.display_name || "Unknown User",
                })),
            };

            commentsMap.get(comment.restaurant_id).push(transformedComment);
        });

        // Format the response
        const reports = restaurants?.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
            city_name: restaurant.cities?.name,
            city_state: restaurant.cities?.state_code,
            cuisine_name: restaurant.cuisines?.name,
            onboarding_stage: restaurant.onboarding_stage,
            description: restaurant.description,
            bdr_target_per_week: restaurant.bdr_target_per_week,
            created_at: restaurant.created_at,
            contacts: contactMap.get(restaurant.id) || [],
            assigned_bdrs: assignmentsMap.get(restaurant.id) || [],
            comments: commentsMap.get(restaurant.id) || [],
        }));

        return NextResponse.json({ reports });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
