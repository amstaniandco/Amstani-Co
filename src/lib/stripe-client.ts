import { loadStripe } from "@stripe/stripe-js";

// Shared browser-side Stripe instance. loadStripe memoizes internally, but we
// export a single promise so every Elements provider reuses the same load.
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
