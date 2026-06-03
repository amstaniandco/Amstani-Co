import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
});

export default stripe;

export const STRIPE_CURRENCY = "usd";
