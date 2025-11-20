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

    console.log('Account Managers API - User:', user.email);
    console.log('Account Managers API - Is Super Admin:', isSuperAdmin);
    console.log('Account Managers API - app_metadata:', user.app_metadata);

    if (!isSuperAdmin) {
      console.log('Account Managers API - Access denied: Not a super admin');
      return NextResponse.json(
        { error: "Forbidden - Super Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all Account Managers
    const { data: accountManagerRoles, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "ACCOUNT_MANAGER");

    if (error) {
      console.error("Error fetching account manager roles:", error);
      return NextResponse.json(
        { error: "Failed to fetch account managers" },
        { status: 500 }
      );
    }

    if (!accountManagerRoles || accountManagerRoles.length === 0) {
      return NextResponse.json({ accountManagers: [] });
    }

    // Get user IDs
    const userIds = accountManagerRoles.map((role: any) => role.user_id);

    // Fetch profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch account manager profiles" },
        { status: 500 }
      );
    }

    // Get city counts and emails for each Account Manager
    const accountManagersWithCities = await Promise.all(
      (profiles || []).map(async (profile: any) => {
        // Get city count
        const { count } = await supabase
          .from("account_manager_cities")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id);

        // Get email from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);

        return {
          id: profile.user_id,
          email: userData?.user?.email || 'No email',
          display_name: profile.display_name || userData?.user?.email || 'Unknown',
          city_count: count || 0,
        };
      })
    );

    // Sort by display name
    const validAccountManagers = accountManagersWithCities
      .filter((am) => am !== null)
      .sort((a, b) => a.display_name.localeCompare(b.display_name));

    console.log('Account Managers API - Found:', validAccountManagers.length, 'account managers');

    return NextResponse.json({ accountManagers: validAccountManagers });
  } catch (error: any) {
    console.error("Error in GET /api/admin/account-managers:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
