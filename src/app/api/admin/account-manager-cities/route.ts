import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "Query parameter 'userId' is required" },
      { status: 400 }
    );
  }

  const authHeader =
    request.headers.get("authorization") ??
    request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization Bearer token required" },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const {
      data: { user },
      error: tokenError,
    } = await supabaseAdmin.auth.getUser(token);
    if (tokenError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (user.app_metadata?.is_super_admin !== true) {
      return NextResponse.json(
        { error: "Forbidden: not a super admin" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("account_manager_cities")
      .select("city_id, cities(id, name, state_code)")
      .eq("user_id", userId)
      .order("cities(name)");

    if (error) {
      console.error("Supabase select account_manager_cities error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const cities =
      data?.flatMap((row) => {
        const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
        if (!city || !city.id) return [];
        return [
          {
            id: city.id,
            label: `${city.name}, ${city.state_code}`,
          },
        ];
      }) ?? [];

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("Unexpected error loading account manager cities:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
