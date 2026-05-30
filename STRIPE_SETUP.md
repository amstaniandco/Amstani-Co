# Stripe Connect Setup Guide — Amstani-Co

This document explains the full Stripe Connect architecture, how the code works, and every step you must take after the code is written.

---

## Architecture Overview

```
Customer pays Rs 1,000
        │
        ▼
  Stripe collects on
  your PLATFORM account
        │
    Webhook fires
  payment_intent.succeeded
        │
   ┌────┴─────────────────────────────┐
   │                                  │
   ▼                                  ▼
Transfer Rs 800 (80%)          Platform keeps
to Store Owner's               Rs 200 (20%)
Stripe Express account         as admin fee
   │
   ▼
Stripe deposits to
store owner's bank account
```

- **Account type used:** Stripe Express (Stripe handles KYC/verification for each store owner)
- **Charge model:** Separate charges + transfers (one charge on platform, then Transfer objects to each store)
- **Your platform fee:** 20% (configured in `src/lib/stripe.ts` → `PLATFORM_FEE_PERCENT`)

---

## Files Added / Modified

| File | Purpose |
|---|---|
| `src/lib/stripe.ts` | Stripe server singleton, fee constant, currency setting |
| `src/app/api/stripe/connect/onboard/route.ts` | Creates Express account + onboarding link for store owner |
| `src/app/api/stripe/connect/status/route.ts` | Returns whether a store owner's account is verified |
| `src/app/api/stripe/connect/dashboard/route.ts` | Returns a one-time Stripe Express dashboard login URL |
| `src/app/api/stripe/checkout/route.ts` | Creates orders in MongoDB + a Stripe PaymentIntent |
| `src/app/api/webhooks/stripe/route.ts` | Handles `payment_intent.succeeded` → marks orders Paid + creates Transfers |
| `src/app/(owner)/owner/stripe/page.tsx` | Store owner UI page to connect/manage their Stripe account |
| `src/app/(customers)/checkout/components/StripePaymentForm.tsx` | Stripe Elements card form |
| `src/app/(customers)/checkout/page.tsx` | Updated to two-step checkout (address → Stripe payment) |

---

## Step-by-Step: What You Must Do After This Code

### Step 1 — Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up or log in.
2. Complete your **platform business verification** (your company name, EIN/business number, bank account for payouts to you).
3. Switch to **test mode** (toggle in top-right) until you go live.

---

### Step 2 — Enable Stripe Connect

1. In the Stripe Dashboard, go to **Connect → Get started**.
2. Under **Platform settings**, set:
   - **Business name:** Amstani Co (shown to store owners during onboarding)
   - **Branding:** Upload your logo and set your brand color
   - **Redirect URI after onboarding:** `https://your-domain.com/owner/stripe?success=true`
3. Under **Connect → Settings → Oauth settings**, make sure Express onboarding is enabled.

---

### Step 3 — Get Your API Keys

1. Go to **Developers → API keys**.
2. Copy:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

Add them to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 4 — Configure the Webhook

#### For local development:

1. Install the Stripe CLI:
   ```
   # Windows (via Scoop)
   scoop install stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. Log in:
   ```
   stripe login
   ```

3. Forward events to your local server:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI will print a **webhook signing secret** (`whsec_...`). Copy it to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### For production:

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Select these events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` ← check "Listen to events on Connected accounts"
4. After saving, click **Reveal** to get the signing secret (`whsec_...`).
5. Add it to your production environment variables.

---

### Step 5 — Add a Link to the Stripe Page in the Owner Dashboard

The owner Stripe page is at `/owner/stripe`. Add a link to it in your store owner navigation/sidebar so owners can find it. Example:

```tsx
<a href="/owner/stripe">Payouts & Stripe</a>
```

---

### Step 6 — Test the Full Flow

#### Test card numbers (use in Stripe test mode):

| Scenario | Card Number | Expiry | CVC |
|---|---|---|---|
| Successful payment | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Card declined | `4000 0000 0000 0002` | Any future date | Any 3 digits |
| Requires 3D Secure | `4000 0025 0000 3155` | Any future date | Any 3 digits |

#### Test onboarding (store owner side):

1. Log in as a store owner → go to `/owner/stripe`.
2. Click **Connect with Stripe**.
3. On the Stripe-hosted page, use test details (Stripe provides fake data options in test mode).
4. Return to your site — you should see all status badges turn green.

#### Test customer checkout:

1. Add items to cart → go to `/checkout`.
2. Fill in the shipping address → click **Continue to Payment**.
3. Enter test card `4242 4242 4242 4242` → click **Pay**.
4. Check your MongoDB `orders` collection — `paymentStatus` should update to `"Paid"`.
5. Check the Stripe Dashboard → **Connect → Transfers** — you should see a transfer to the store owner's account.

---

## Payment Flow (Step by Step in Code)

```
1. Customer clicks "Continue to Payment" on /checkout
   └── POST /api/stripe/checkout
       ├── Validates cart
       ├── Creates MongoDB order(s) — one per store, paymentStatus: "Pending"
       ├── stripe.paymentIntents.create({ amount, currency, metadata: { orderIds, storeBreakdown } })
       ├── Clears cart
       └── Returns { clientSecret, orderIds, total }

2. Frontend renders <Elements clientSecret>
   └── Customer enters card → stripe.confirmPayment()

3. Stripe fires webhook: payment_intent.succeeded
   └── POST /api/webhooks/stripe
       ├── Verifies stripe-signature header
       ├── Updates all orders → paymentStatus: "Paid"
       └── For each store with a connected account:
           └── stripe.transfers.create({ amount: 80%, destination: stripeAccountId, source_transaction: chargeId })

4. Store owner's Stripe Express account receives the transfer
   └── Stripe pays out to their bank on their payout schedule
```

---

## Store Owner Onboarding Flow

```
1. Owner goes to /owner/stripe
2. Clicks "Connect with Stripe"
3. POST /api/stripe/connect/onboard
   ├── stripe.accounts.create({ type: "express" })
   ├── Saves stripeAccountId to stores collection in MongoDB
   └── Returns Stripe-hosted onboarding URL

4. Owner completes KYC on Stripe's page
   └── Stripe collects: legal name, date of birth, address, bank account

5. Stripe redirects back to /owner/stripe?success=true
6. GET /api/stripe/connect/status → chargesEnabled: true
7. Store owner is now eligible to receive transfers
```

---

## Currency

The code currently uses **USD**. To switch to Pakistani Rupees (PKR):

1. In `src/lib/stripe.ts`, change:
   ```ts
   export const STRIPE_CURRENCY = "pkr";
   ```

2. Verify that:
   - Your Stripe platform account is set up for PKR
   - Stripe Connect payouts are available in PKR in your region (check [Stripe's supported currencies](https://stripe.com/docs/currencies))
   - PKR is a **zero-decimal currency** in some Stripe regions — if so, remove the `* 100` multipliers in `src/app/api/stripe/checkout/route.ts`

---

## Platform Fee

Change the fee at any time in `src/lib/stripe.ts`:

```ts
export const PLATFORM_FEE_PERCENT = 0.2; // 20%
```

The checkout API automatically calculates 80% for the store and 20% for the platform.

---

## Important: Stores Without Stripe Connected

If a store owner has not completed Stripe onboarding when a customer orders from them:
- The order is still created and the customer is still charged.
- The transfer to that store is skipped (the money stays in your platform account).
- You can manually issue the transfer later from the Stripe Dashboard → **Connect → Transfers → New Transfer**.
- Consider adding a check in your store listing UI to warn customers or hide stores that are not payment-ready.

---

## Going Live Checklist

- [ ] Complete your own Stripe platform business verification (not test mode)
- [ ] Replace `sk_test_` / `pk_test_` keys with `sk_live_` / `pk_live_` in production env
- [ ] Register the production webhook endpoint in Stripe Dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Confirm that Connect is available in Pakistan (your country) for both platform and connected accounts
- [ ] Decide on your payout schedule for store owners (Stripe default is 2-day rolling)
- [ ] Inform store owners that they must complete Stripe onboarding before they can receive payouts

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `Invalid signature` in webhook | Wrong `STRIPE_WEBHOOK_SECRET` | Copy the secret from the Stripe CLI output or Dashboard, restart server |
| `No Stripe account connected` on owner page | Store not found with `ownerId` | Make sure the logged-in user has role `owner` and has a store document |
| Transfer fails in webhook | Store's `stripeAccountId` is missing or account not fully verified | Owner must complete onboarding; check `charges_enabled` |
| `Missing STRIPE_SECRET_KEY` on server start | Env var not set | Add to `.env` and restart dev server |
| Payment succeeds but orders still show "Pending" | Webhook not reaching local server | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
