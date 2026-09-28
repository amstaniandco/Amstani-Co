import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const applications = await db
      .collection("store_applications")
      .find({ status: { $in: ["forwarded_to_admin", "approved_by_admin", "denied_by_admin"] } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const ownerApplications = await db
      .collection("store_owner_applications")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const normalizedOwnerApplications = ownerApplications.map((application) => ({
      _id: `owner-${application._id.toString()}`,
      applicant: {
        name: application.full_name ?? "",
        email: application.email ?? "",
        phone: application.phone ?? "",
        message: `State: ${application.state ?? ""} | Address: Not provided`,
      },
      status: application.status ?? "new",
      createdAt: application.createdAt,
      source: "store_owner_application",
      application: {
        full_name: application.full_name ?? "",
        email: application.email ?? "",
        phone: application.phone ?? "",
        preferred_contact_method: application.preferred_contact_method ?? "",
        state: application.state ?? "",
        business_status: application.business_status ?? "",
        online_selling_experience: application.online_selling_experience ?? "",
        platforms_used: application.platforms_used ?? [],
        platforms_other: application.platforms_other ?? "",
        interest_reasons: application.interest_reasons ?? [],
        interest_other: application.interest_other ?? "",
        sales_channels: application.sales_channels ?? [],
        sales_other: application.sales_other ?? "",
        target_customers: application.target_customers ?? [],
        target_other: application.target_other ?? "",
        weekly_time_commitment: application.weekly_time_commitment ?? "",
        planned_start_date: application.planned_start_date ?? "",
        minimum_order_acknowledgment: application.minimum_order_acknowledgment ?? "",
        readiness_level: application.readiness_level ?? "",
        applicant_questions: application.applicant_questions ?? "",
        contact_consent: application.contact_consent ?? false,
        privacy_acknowledgment: application.privacy_acknowledgment ?? false,
        createdAt: application.createdAt,
      },
    }));

    return NextResponse.json({ applications: [...applications, ...normalizedOwnerApplications] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stores/applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
