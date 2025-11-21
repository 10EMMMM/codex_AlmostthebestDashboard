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
            .is("deleted_at", null)
            .single();

        if (error || !restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
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

        // Soft delete restaurant
        const { error } = await supabase
            .from("restaurants")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id);

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
