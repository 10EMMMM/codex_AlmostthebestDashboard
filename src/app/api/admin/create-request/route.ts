import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type InsertPayload = {
  title: string;
  description: string;
  request_type: string;
  city_id: string;
  requester_id?: string;  // Legacy field
  requested_by?: string;  // NEW: For proxy creation
  created_by: string;
  priority: string | null;
  category: string | null;
  volume: number | null;
  company: string | null;
  need_answer_by: string | null;
  delivery_date: string | null;
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
      error: sessionError,
    } = await supabaseAdmin.auth.getUser(token);
    if (sessionError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload = (await request.json()) as InsertPayload;
    if (
      !payload?.title ||
      !payload?.request_type ||
      !payload?.city_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine if this is a proxy creation
    const isSuperAdmin = user.app_metadata?.is_super_admin === true;
    const requestedBy = isSuperAdmin && payload.requested_by
      ? payload.requested_by
      : user.id;
    const createdOnBehalf = isSuperAdmin && payload.requested_by ? true : false;

    // Build the insert data
    const insertData = {
      title: payload.title,
      description: payload.description || "",
      request_type: payload.request_type,
      city_id: payload.city_id,
      created_by: user.id,
      requester_id: requestedBy,
      priority: payload.priority || null,
      category: payload.category || null,
      volume: payload.volume || null,
      company: payload.company || null,
      need_answer_by: payload.need_answer_by || null,
      delivery_date: payload.delivery_date || null,
      status: "new",
    };

    const { error } = await supabaseAdmin.from("requests").insert(insertData);
    if (error) {
      console.error("Admin request insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error creating request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
