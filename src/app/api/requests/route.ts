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

        // Check if user is super admin
        const isSuperAdmin = user.app_metadata?.is_super_admin === true;

        // Fetch requests with cities
        let query = supabase
            .from("requests")
            .select("*, cities(name, state_code)")
            .order("created_at", { ascending: false });

        if (!isSuperAdmin) {
            // For non-super admins, only show requests they created, requested, or are assigned to
            query = query.or(`created_by.eq.${user.id},requested_by.eq.${user.id},id.in.(
        select request_id from request_assignments where user_id = '${user.id}'
      )`);
        }

        const { data: requests, error } = await query;

        if (error) {
            console.error("Error fetching requests:", error);
            return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
        }

        if (!requests || requests.length === 0) {
            return NextResponse.json({ requests: [] });
        }

        // Get unique user IDs for creators and requesters
        const creatorIds = [...new Set(requests.map((r: any) => r.created_by).filter(Boolean))];
        const requesterIds = [...new Set(requests.map((r: any) => r.requested_by).filter(Boolean))];
        const allUserIds = [...new Set([...creatorIds, ...requesterIds])];

        // Fetch profiles for all users
        const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, email")
            .in("user_id", allUserIds);

        // Create a map for quick lookup
        const profileMap = new Map();
        profiles?.forEach((profile: any) => {
            profileMap.set(profile.user_id, profile);
        });

        // Format the response
        const formattedRequests = requests?.map((req: any) => {
            const creator = profileMap.get(req.created_by);
            const requester = profileMap.get(req.requested_by);

            return {
                id: req.id,
                request_type: req.request_type,
                title: req.title,
                description: req.description,
                city_id: req.city_id,
                city_name: req.cities?.name,
                city_state: req.cities?.state_code,
                budget: req.budget,
                deadline: req.deadline,
                status: req.status || "PENDING",
                created_by: req.created_by,
                requested_by: req.requested_by,
                created_on_behalf: req.created_on_behalf || false,
                created_at: req.created_at,
                creator_name: creator?.display_name || creator?.email,
                requester_name: requester?.display_name || requester?.email,
            };
        });

        return NextResponse.json({ requests: formattedRequests || [] });
    } catch (error: any) {
        console.error("Error in GET /api/requests:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
