import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { EMAIL_REPLY_TO, sendEmail } from "../../../lib/email";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const arrayFields = ["platforms_used", "interest_reasons", "sales_channels", "target_customers"] as const;

function clean(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 20) : [];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const fullName = clean(body.full_name, 160);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 60);
    const preferredContactMethod = clean(body.preferred_contact_method, 40);
    const state = clean(body.state, 80);
    const requiredTextFields = [
      ["preferred contact method", preferredContactMethod], ["state", state],
      ["business status", clean(body.business_status, 160)], ["online selling experience", clean(body.online_selling_experience, 160)],
      ["weekly time commitment", clean(body.weekly_time_commitment, 100)], ["planned start date", clean(body.planned_start_date, 100)],
      ["minimum order acknowledgment", clean(body.minimum_order_acknowledgment, 180)], ["readiness level", clean(body.readiness_level, 160)],
    ];
    if (fullName.length < 2 || !emailPattern.test(email) || !phone || requiredTextFields.some(([, value]) => !value)) {
      return NextResponse.json({ error: "Please complete all required fields with valid information." }, { status: 400 });
    }

    const lists = Object.fromEntries(arrayFields.map((field) => [field, cleanList(body[field])]));
    if (arrayFields.some((field) => !lists[field].length)) {
      return NextResponse.json({ error: "Please select at least one answer in each checkbox group." }, { status: 400 });
    }
    if (body.contact_consent !== true || body.privacy_acknowledgment !== true) {
      return NextResponse.json({ error: "Both consent statements are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const now = new Date();
    const recentDuplicate = await db.collection("store_owner_applications").findOne({ email, createdAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } }, { projection: { _id: 1 } });
    if (recentDuplicate) return NextResponse.json({ error: "An application was already submitted recently for this email." }, { status: 409 });

    const application = {
      full_name: fullName, email, phone, preferred_contact_method: preferredContactMethod, state,
      business_status: clean(body.business_status, 160), online_selling_experience: clean(body.online_selling_experience, 160),
      platforms_used: lists.platforms_used, platforms_other: clean(body.platforms_other, 300),
      interest_reasons: lists.interest_reasons, interest_other: clean(body.interest_other, 300),
      sales_channels: lists.sales_channels, sales_other: clean(body.sales_other, 300),
      target_customers: lists.target_customers, target_other: clean(body.target_other, 300),
      weekly_time_commitment: clean(body.weekly_time_commitment, 100), planned_start_date: clean(body.planned_start_date, 100),
      minimum_order_acknowledgment: clean(body.minimum_order_acknowledgment, 180), readiness_level: clean(body.readiness_level, 160),
      applicant_questions: clean(body.applicant_questions, 1000), contact_consent: true, privacy_acknowledgment: true,
      utm: body.utm && typeof body.utm === "object" ? body.utm : {}, status: "new", createdAt: now, updatedAt: now,
    };
    const result = await db.collection("store_owner_applications").insertOne(application);
    const rows = Object.entries({ Name: fullName, Email: email, Phone: phone, State: state, "Contact method": preferredContactMethod, "Business status": application.business_status, "Selling experience": application.online_selling_experience, "Platforms used": lists.platforms_used.join(", "), "Interest reasons": lists.interest_reasons.join(", "), "Sales channels": lists.sales_channels.join(", "), "Target customers": lists.target_customers.join(", "), "Time commitment": application.weekly_time_commitment, "Start timeline": application.planned_start_date, "Minimum order": application.minimum_order_acknowledgment, Readiness: application.readiness_level, Questions: application.applicant_questions || "No question provided." }).map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`).join("");
    const adminEmail = process.env.STORE_OWNER_APPLICATION_EMAIL || EMAIL_REPLY_TO;
    const applicantEmail = email;
    await Promise.all([
      sendEmail({ to: adminEmail, subject: `New Store Owner Application — ${fullName}`, html: `<h2>New Amstani &amp; Co store-owner application</h2>${rows}<p><strong>Status:</strong> New</p>`, replyTo: applicantEmail }),
      sendEmail({ to: applicantEmail, subject: "We Received Your Amstani & Co Store Owner Application", html: `<h2>Thank you for applying, ${escapeHtml(fullName)}.</h2><p>We have received your application successfully. Our team will review the information and contact you regarding next steps.</p><p>Submitting an application does not guarantee acceptance or store approval. Applicable costs, requirements, shipping arrangements, and responsibilities will be explained before any commitment or payment.</p>`, replyTo: adminEmail }),
    ]);

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("POST /api/store-owner-applications error:", error);
    return NextResponse.json({ error: "Could not submit application." }, { status: 500 });
  }
}
