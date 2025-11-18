import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type UpdatePayload = {
  request_id: string;
  updates: {
    title?: string | null;
    description?: string | null;
    status?: string;
    request_type?: string;
    need_answer_by?: string | null;
    delivery_date?: string | null;
    priority?: string | null;
    category?: string | null;
    volume?: number | null;
    company?: string | null;
  };
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload = (await request.json()) as UpdatePayload;
    if (!payload?.request_id || !payload?.updates) {
      return NextResponse.json(
        { error: "Missing request_id or updates" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("requests")
      .select("id, requester_id")
      .eq("id", payload.request_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const isSuperAdmin = user.app_metadata?.is_super_admin === true;
    const isOwner = existing.requester_id === user.id;
    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: you cannot edit this request" },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {};
    Object.entries(payload.updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("requests")
      .update(updates)
      .eq("id", payload.request_id);

    if (updateError) {
      console.error("Error updating request:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error updating request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
