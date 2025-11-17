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

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
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

    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "ACCOUNT_MANAGER");
    if (roleError) {
      console.error("Supabase select user_roles error:", roleError);
      return NextResponse.json({ error: roleError.message }, { status: 400 });
    }

    const managerIds = Array.from(
      new Set(
        (roleRows ?? [])
          .map((row) => row.user_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (!managerIds.length) {
      return NextResponse.json({ managers: [] });
    }

    const { data: profileRows, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", managerIds);
    if (profileError) {
      console.error("Supabase select profiles error:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const profileLookup = new Map(
      (profileRows ?? []).map((profile) => [
        profile.user_id,
        profile.display_name ?? null,
      ])
    );

    const emailLookup = new Map<string, string>();
    await Promise.all(
      managerIds.map(async (id) => {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
        if (!error && data?.user) {
          emailLookup.set(id, data.user.email ?? "");
        }
      })
    );

    const managers = managerIds.map((id) => ({
      id,
      label:
        profileLookup.get(id) ||
        emailLookup.get(id) ||
        "Account Manager",
    }));

    return NextResponse.json({ managers });
  } catch (error) {
    console.error("Unexpected error loading account managers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
