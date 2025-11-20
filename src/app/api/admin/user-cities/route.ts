import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");

        // Create Supabase client with service role (bypasses RLS)
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        // Verify the requesting user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("User Cities API - Requesting user:", user.email);
        console.log("User Cities API - Target user ID:", userId);

        // Get city assignments for the target user
        const { data: cityAssignments, error: assignmentError } = await supabase
            .from("account_manager_cities")
            .select("city_id")
            .eq("user_id", userId);

        if (assignmentError) {
            console.error("Error fetching city assignments:", assignmentError);
            return NextResponse.json(
                { error: "Failed to fetch city assignments" },
                { status: 500 }
            );
        }

        if (!cityAssignments || cityAssignments.length === 0) {
            console.log("No city assignments found for user:", userId);
            return NextResponse.json({ cities: [] });
        }

        // Extract city IDs
        const cityIds = cityAssignments.map((assignment: any) => assignment.city_id);

        // Fetch the actual city data
        const { data: cities, error: citiesError } = await supabase
            .from("cities")
            .select("id, name, state_code")
            .in("id", cityIds)
            .eq("is_active", true)
            .order("name");

        if (citiesError) {
            console.error("Error fetching cities:", citiesError);
            return NextResponse.json(
                { error: "Failed to fetch cities" },
                { status: 500 }
            );
        }

        console.log(`User Cities API - Found ${cities?.length || 0} cities for user ${userId}`);

        return NextResponse.json({ cities: cities || [] });
    } catch (error: any) {
        console.error("Error in GET /api/admin/user-cities:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
