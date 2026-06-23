import { NextResponse } from "next/server";

// Replaced by /api/admin/global-catalog/compute-prices
export async function GET() { return NextResponse.json({ error: "Deprecated" }, { status: 410 }); }
export async function POST() { return NextResponse.json({ error: "Deprecated" }, { status: 410 }); }
export async function DELETE() { return NextResponse.json({ error: "Deprecated" }, { status: 410 }); }
