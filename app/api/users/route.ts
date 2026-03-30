import { NextResponse } from "next/server";
import { getUsers, createUser } from "../../libs/db";

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const newUser = await createUser({ name: body.name, email: body.email });
  return NextResponse.json(newUser, { status: 201 });
}
