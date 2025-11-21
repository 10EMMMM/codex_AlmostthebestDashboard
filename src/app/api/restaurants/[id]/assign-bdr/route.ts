import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/restaurants/[id]/assign-bdr
 * Assign a BDR to a restaurant
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: restaurantId } = await params;

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

        // Parse request body
        const body = await request.json();
        const { bdrId } = body;

        if (!bdrId) {
            return NextResponse.json(
                { error: "BDR ID is required" },
                { status: 400 }
            );
        }

        // Upsert assignment (will update if exists, insert if not)
        const { error: assignmentError } = await supabase
            .from("restaurant_assignments")
            .upsert({
                restaurant_id: restaurantId,
                user_id: bdrId,
                role: "BDR",
            });

        if (assignmentError) {
            console.error("Error assigning BDR:", assignmentError);
            return NextResponse.json(
                { error: "Failed to assign BDR" },
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
