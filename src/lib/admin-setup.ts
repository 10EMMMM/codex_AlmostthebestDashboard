import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@acme.com";
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin!" + Math.random().toString(36).substring(2, 6);

type SetupResult =
  | { status: "created" | "existing"; userId: string; email: string; message: string }
  | { status: "error"; message: string };

function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase URL or service role key.");
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

export async function ensureSuperAdmin(): Promise<SetupResult> {
  try {
    const supabaseAdmin = getAdminClient();
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      query: SUPER_ADMIN_EMAIL,
    });
    if (listError) {
      throw listError;
    }

    const existing =
      userList?.users?.find(
        (user) => user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      ) ?? null;

    const targetUser =
      existing ||
      (
        await supabaseAdmin.auth.admin.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          email_confirm: true,
          app_metadata: { is_super_admin: true },
        })
      ).data?.user;

    if (!targetUser?.id) {
      throw new Error("Unable to create or locate super admin user.");
    }

    const { data: cityData } = await supabaseAdmin.from("cities").select("id").limit(1).maybeSingle();
    const cityId = cityData?.id ?? null;

    await supabaseAdmin.from("profiles").upsert({
      user_id: targetUser.id,
      display_name: "Super Admin",
      timezone: "America/New_York",
      city_id: cityId,
    });

    await supabaseAdmin.from("user_roles").upsert({
      user_id: targetUser.id,
      role: "ADMIN",
      assigned_by: targetUser.id,
    });

    return {
      status: existing ? "existing" : "created",
      userId: targetUser.id,
      email: SUPER_ADMIN_EMAIL,
      message: existing ? "Super admin already exists." : "Created super admin user.",
    };
  } catch (error: any) {
    return { status: "error", message: error?.message ?? "Unexpected error" };
  }
}

export async function checkDatabaseConnection() {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("cities").select("id").limit(1);
    return error ? `DB error: ${error.message}` : "Database connection available.";
  } catch (error: any) {
    return `Connection check failed: ${error?.message ?? "Missing credentials"}`;
  }
}
