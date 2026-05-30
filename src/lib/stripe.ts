import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

export default stripe;

// 20% platform fee — Amstani keeps this on every sale
export const PLATFORM_FEE_PERCENT = 0.2;

// Change to "pkr" for Pakistani Rupees once you verify Stripe Connect supports PKR payouts in your region
export const STRIPE_CURRENCY = "usd";
