import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import stripe, { getOrCreateStripeCustomer } from "../../../../lib/stripe";
import { PaymentMethod } from "../../../../models/user";

function getUserObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function providerFromBrand(brand?: string | null): PaymentMethod["provider"] {
  switch ((brand || "").toLowerCase()) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    case "discover":
      return "Discover";
    default:
      return brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "Card";
  }
}

function toDisplayCard(pm: { id: string; card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number } | null }): PaymentMethod {
  const card = pm.card;
  const month = String(card?.exp_month ?? "").padStart(2, "0");
  const year = String(card?.exp_year ?? "").slice(-2);
  return {
    id: pm.id,
    stripePaymentMethodId: pm.id,
    provider: providerFromBrand(card?.brand),
    last4: card?.last4 ?? "",
    expiry: month && year ? `${month}/${year}` : "",
  };
}

// GET /api/user/cards — list the customer's saved cards from Stripe.
export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const customerId = await getOrCreateStripeCustomer(db, userId);

    const methods = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    const cards = methods.data.map(toDisplayCard);

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/cards error:", error);
    return NextResponse.json({ error: "Failed to load cards" }, { status: 500 });
  }
}

// POST /api/user/cards — after a card is saved via a SetupIntent on the profile,
// mark it redisplayable so it also appears at checkout. Body: { paymentMethodId }.
export async function POST(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const paymentMethodId = typeof body.paymentMethodId === "string" ? body.paymentMethodId.trim() : "";
    if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const customerId = await getOrCreateStripeCustomer(db, userId);

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== customerId) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Redisplay lets the card surface in the checkout PaymentElement later.
    const updated = await stripe.paymentMethods.update(paymentMethodId, { allow_redisplay: "always" });

    return NextResponse.json({ message: "Card saved", card: toDisplayCard(updated) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/cards error:", error);
    return NextResponse.json({ error: "Failed to save card" }, { status: 500 });
  }
}

// DELETE /api/user/cards?id=<paymentMethodId> — detach the card from the customer.
export async function DELETE(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");
    if (!cardId) return NextResponse.json({ error: "Card ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const customerId = await getOrCreateStripeCustomer(db, userId);

    const pm = await stripe.paymentMethods.retrieve(cardId);
    if (pm.customer !== customerId) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await stripe.paymentMethods.detach(cardId);

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/user/cards error:", error);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
