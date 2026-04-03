import { NextResponse } from "next/server";
import { getUsersByRole } from "../../../lib/db";

export async function GET() {
  const users = await getUsersByRole("user");
  return NextResponse.json(users);
}
