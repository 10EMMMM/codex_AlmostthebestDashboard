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

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.toLowerCase();
        const types = searchParams.get("types")?.split(",").filter(Boolean);
        const statuses = searchParams.get("statuses")?.split(",").filter(Boolean);
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortDirection = searchParams.get("sortDirection") || "desc";

        // Build query
        let query = supabase
            .from("requests")
            .select(`
                *,
                cities(name, state_code),
                request_comments(
                    id,
                    content,
                    created_at,
                    user_id,
                    parent_comment_id,
                    deleted_at
                )
            `)
            .order(sortBy, { ascending: sortDirection === "asc" });

        // Apply filters
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
        }

        if (types && types.length > 0) {
            query = query.in("request_type", types);
        }

        if (statuses && statuses.length > 0) {
            query = query.in("status", statuses);
        }

        if (dateFrom) {
            query = query.gte("created_at", dateFrom);
        }

        if (dateTo) {
            query = query.lte("created_at", dateTo);
        }

        if (!isSuperAdmin) {
            // For non-super admins, only show requests they created, requested, or are assigned to
            query = query.or(`created_by.eq.${user.id},requester_id.eq.${user.id},id.in.(
                select request_id from request_assignments where user_id = '${user.id}'
            )`);
        }

        const { data: requests, error } = await query;

        if (error) {
            console.error("Error fetching report data:", error);
            return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
        }

        if (!requests || requests.length === 0) {
            return NextResponse.json({ requests: [] });
        }

        // --- Fetch User Profiles (Creators, Requesters, Commenters, BDRs) ---
        const userIds = new Set<string>();
        requests.forEach((r: any) => {
            if (r.created_by) userIds.add(r.created_by);
            if (r.requester_id) userIds.add(r.requester_id);
            r.request_comments?.forEach((c: any) => {
                if (c.user_id) userIds.add(c.user_id);
            });
        });

        // Fetch BDR assignments
        const requestIds = requests.map((r: any) => r.id);
        const { data: assignments } = await supabase
            .from('request_assignments')
            .select('request_id, user_id')
            .in('request_id', requestIds)
            .eq('role', 'BDR');

        assignments?.forEach((a: any) => userIds.add(a.user_id));

        const allUserIds = Array.from(userIds);

        // Fetch profiles
        const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", allUserIds);

        const profileMap = new Map();
        profiles?.forEach((profile: any) => {
            profileMap.set(profile.user_id, profile);
        });

        // Fallback for missing profiles
        const missingUserIds = allUserIds.filter(id => !profileMap.has(id));
        if (missingUserIds.length > 0) {
            for (const userId of missingUserIds) {
                try {
                    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
                    if (authUser?.user) {
                        profileMap.set(userId, {
                            user_id: userId,
                            display_name: authUser.user.user_metadata?.display_name || authUser.user.email,
                        });
                    }
                } catch (e) {
                    console.error(`Failed to fetch auth user ${userId}`, e);
                }
            }
        }

        // --- Process Data ---
        const formattedRequests = requests.map((req: any) => {
            const creator = profileMap.get(req.created_by);
            const requester = profileMap.get(req.requester_id);

            // Process Assignments
            const reqAssignments = assignments?.filter((a: any) => a.request_id === req.id) || [];
            const assignedBdrs = reqAssignments.map((a: any) => {
                const p = profileMap.get(a.user_id);
                return { id: a.user_id, name: p?.display_name || 'Unknown' };
            });

            // Process Comments (Threaded)
            const rawComments = req.request_comments?.filter((c: any) => !c.deleted_at) || [];
            const commentsWithUser = rawComments.map((c: any) => ({
                ...c,
                user_name: profileMap.get(c.user_id)?.display_name || 'Unknown User'
            }));

            // Sort comments by date
            commentsWithUser.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            // Build threads
            const commentMap = new Map();
            const rootComments: any[] = [];

            commentsWithUser.forEach((c: any) => {
                c.replies = [];
                commentMap.set(c.id, c);
            });

            commentsWithUser.forEach((c: any) => {
                if (c.parent_comment_id) {
                    const parent = commentMap.get(c.parent_comment_id);
                    if (parent) {
                        parent.replies.push(c);
                    } else {
                        // Orphaned reply, treat as root
                        rootComments.push(c);
                    }
                } else {
                    rootComments.push(c);
                }
            });

            return {
                id: req.id,
                title: req.title,
                description: req.description,
                status: req.status,
                company: req.company,
                city_name: req.cities?.name,
                city_state: req.cities?.state_code,
                created_at: req.created_at,
                assigned_bdrs: assignedBdrs,
                comments: rootComments, // Threaded comments
                creator_name: creator?.display_name,
                requester_name: requester?.display_name,
            };
        });

        return NextResponse.json({ requests: formattedRequests });

    } catch (error: any) {
        console.error("Error in GET /api/reports:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
