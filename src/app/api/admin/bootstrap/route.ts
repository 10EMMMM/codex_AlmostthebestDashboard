import { NextResponse } from "next/server";
import { ensureSuperAdmin, checkDatabaseConnection } from "@/lib/admin-setup";

export async function POST() {
  const result = await ensureSuperAdmin();
  const connection = await checkDatabaseConnection();
  return NextResponse.json({
    ...result,
    connection,
  });
}
