import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Fetch restaurant with related data
        const { data: restaurant, error } = await supabase
            .from("restaurants")
            .select(`
                *,
                cities(id, name, state_code),
                cuisines:primary_cuisine_id(id, name)
            `)
            .eq("id", id)
            .single();

        if (error || !restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        // Fetch onboarder profile if exists
        let onboarderName = null;
        if (restaurant.onboarded_by) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("user_id", restaurant.onboarded_by)
                .single();

            if (profile) {
                onboarderName = profile.display_name;
            }
        }

        // Fetch creator profile if exists
        let creatorName = null;
        if (restaurant.created_by) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("user_id", restaurant.created_by)
                .single();

            if (profile) {
                creatorName = profile.display_name;
            }
        }

        // Fetch cuisines for this restaurant
        const { data: restaurantCuisines } = await supabase
            .from("restaurant_cuisines")
            .select(`
                cuisine_id,
                is_primary,
                display_order,
                cuisines (
                    id,
                    name
                )
            `)
            .eq("restaurant_id", id)
            .order("display_order", { ascending: true });

        const cuisines = restaurantCuisines || [];
        const primaryCuisine = cuisines.find((c: any) => c.is_primary);
        const secondaryCuisines = cuisines.filter((c: any) => !c.is_primary);

        // Format response to include all fields
        const formattedRestaurant = {
            ...restaurant,
            slug: restaurant.slug,
            status: restaurant.status,
            description: restaurant.description,
            onboarded_by: restaurant.onboarded_by,
            onboarded_by_name: onboarderName || restaurant.onboarded_by,
            created_by: restaurant.created_by,
            created_by_name: creatorName || restaurant.created_by,
            onboarded_at: restaurant.onboarded_at,
            city_name: restaurant.cities?.name,
            city_state: restaurant.cities?.state_code,
            cuisine_name: primaryCuisine?.cuisines?.name,
            secondary_cuisine_name: secondaryCuisines.length > 0 ? secondaryCuisines[0].cuisines?.name : null,
        };

        // Debug logging
        console.log('🔍 API Response Debug:');
        console.log('  Restaurant ID:', formattedRestaurant.id);
        console.log('  Restaurant Name:', formattedRestaurant.name);
        console.log('  Description:', formattedRestaurant.description);
        console.log('  Description type:', typeof formattedRestaurant.description);
        console.log('  Description length:', formattedRestaurant.description?.length);

        return NextResponse.json({ restaurant: formattedRestaurant });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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
        const updateData: any = {};

        // Only include fields that are provided
        if (body.name !== undefined) updateData.name = body.name;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.city_id !== undefined) updateData.city_id = body.city_id;
        if (body.primary_cuisine_id !== undefined) updateData.primary_cuisine_id = body.primary_cuisine_id;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.onboarding_stage !== undefined) updateData.onboarding_stage = body.onboarding_stage;
        if (body.bdr_target_per_week !== undefined) updateData.bdr_target_per_week = body.bdr_target_per_week;

        updateData.updated_at = new Date().toISOString();

        // Update restaurant
        const { data: restaurant, error } = await supabase
            .from("restaurants")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating restaurant:", error);
            return NextResponse.json(
                { error: "Failed to update restaurant" },
                { status: 500 }
            );
        }

        return NextResponse.json({ restaurant });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Check if permanent delete is requested
        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get("permanent") === "true";

        // Check if user is Super Admin
        let isSuperAdmin = user.app_metadata?.is_super_admin === true;

        if (!isSuperAdmin) {
            // Check user_roles table
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id);

            if (roles && roles.some(r => r.role === 'SUPER_ADMIN')) {
                isSuperAdmin = true;
            }
        }

        if (!isSuperAdmin) {
            return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
        }

        let error;
        if (permanent) {
            // Hard delete
            const { error: deleteError } = await supabase
                .from("restaurants")
                .delete()
                .eq("id", id);
            error = deleteError;
        } else {
            // Soft delete
            const { error: updateError } = await supabase
                .from("restaurants")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);
            error = updateError;
        }

        if (error) {
            console.error("Error deleting restaurant:", error);
            return NextResponse.json(
                { error: "Failed to delete restaurant" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
