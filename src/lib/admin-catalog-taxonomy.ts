export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function requireAdminResponse() {
  const { NextResponse } = await import("next/server");
  const { getUserFromToken } = await import("./auth");

  const tokenUser = await getUserFromToken();
  if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}
