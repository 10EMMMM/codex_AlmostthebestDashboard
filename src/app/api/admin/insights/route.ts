import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  try {
    const [
      requestCount,
      openRequests,
      restaurantCount,
      taskCount,
      bdrCount,
    ] = await Promise.all([
      supabaseAdmin.from("requests").select("id", { count: "exact" }),
      supabaseAdmin
        .from("requests")
        .select("id", { count: "exact" })
        .eq("status", "new"),
      supabaseAdmin.from("restaurants").select("id", { count: "exact" }),
      supabaseAdmin.from("restaurant_tasks").select("id", { count: "exact" }),
      supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact" })
        .eq("role", "BDR"),
    ]);

    return NextResponse.json({
      totalRequests: requestCount.count ?? 0,
      newRequests: openRequests.count ?? 0,
      restaurants: restaurantCount.count ?? 0,
      tasks: taskCount.count ?? 0,
      bdrs: bdrCount.count ?? 0,
    });
  } catch (error: any) {
    console.error("Insights error", error);
    return NextResponse.json({ error: error?.message || "Failed to load insights" }, { status: 500 });
  }
}
