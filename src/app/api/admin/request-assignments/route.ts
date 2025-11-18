import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseAdmin = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

const requireSuperAdmin = async (request: Request, supabaseAdmin: ReturnType<typeof createClient>) => {
  const authHeader =
    request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization Bearer token required" },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  if (user.app_metadata?.is_super_admin !== true) {
    return NextResponse.json({ error: "Forbidden: not a super admin" }, { status: 403 });
  }
  return { user };
};

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authResult = await requireSuperAdmin(request, supabaseAdmin);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("requestIds");
    let ids: string[] | undefined;
    if (idsParam) {
      ids = idsParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }

    let query = supabaseAdmin
      .from("request_assignments")
      .select("request_id, user_id")
      .eq("role", "BDR");

    if (ids && ids.length) {
      query = query.in("request_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase select request_assignments error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const assignments = data ?? [];
    const userIds = Array.from(
      new Set(assignments.map((assignment) => assignment.user_id).filter(Boolean))
    );

    let profileLookup: Record<string, string | null> = {};
    if (userIds.length) {
      const { data: profileRows, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      if (profileError) {
        console.error("Supabase select profiles error:", profileError);
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 }
        );
      }
      profileRows?.forEach((profile) => {
        if (profile.user_id) {
          profileLookup[profile.user_id] = profile.display_name ?? null;
        }
      });
    }

    const payload =
      assignments.map((row) => ({
        request_id: row.request_id,
        user_id: row.user_id,
        display_name: row.user_id
          ? profileLookup[row.user_id] ?? null
          : null,
      })) ?? [];

    return NextResponse.json({ assignments: payload });
  } catch (error) {
    console.error("Unexpected error loading request assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authResult = await requireSuperAdmin(request, supabaseAdmin);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => null);
    const requestId = body?.requestId;
    const bdrUserId = body?.bdrUserId;

    if (!requestId || !bdrUserId) {
      return NextResponse.json(
        { error: "requestId and bdrUserId are required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("request_assignments")
      .upsert(
        {
          request_id: requestId,
          user_id: bdrUserId,
          role: "BDR",
          assigned_at: new Date().toISOString(),
          archived_at: null,
        },
        { onConflict: "request_id,user_id" }
      );

    if (error) {
      console.error("Supabase upsert request_assignments error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error assigning BDR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authResult = await requireSuperAdmin(request, supabaseAdmin);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => null);
    const requestId = body?.requestId;
    const bdrUserId = body?.bdrUserId;

    if (!requestId || !bdrUserId) {
      return NextResponse.json(
        { error: "requestId and bdrUserId are required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("request_assignments")
      .delete()
      .eq("request_id", requestId)
      .eq("user_id", bdrUserId)
      .eq("role", "BDR");

    if (error) {
      console.error("Supabase delete request_assignments error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error removing BDR assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
