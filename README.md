# Amstani & Co

A multi-vendor e-commerce marketplace ("digital mall") built with Next.js. Customers browse stores and products, store owners run their own storefronts, and admins manage the global catalog, stores, and finances from a dedicated dashboard.

## Features

- **Customer storefront** — home, product catalog, categories, new arrivals, sales, wishlist, cart, checkout, orders, claims, notifications, and per-store pages with catalogs, chat, and offers.
- **Store owner portal** — store signup and onboarding, product listings, promotions, and Stripe Connect payouts.
- **Admin dashboard** — global product catalog, tax & pricing, store applications and signup requests, store promotion, user management, claims, communications, and finance/stock views.
- **Payments** — Stripe Checkout for customers and Stripe Connect for store payouts, with webhook handling.
- **Auth** — JWT-based sessions with email/password (bcrypt) plus Google, Facebook, and Twitter/X OAuth.
- **Media & email** — image uploads via Cloudinary; transactional email via Resend.
- **Product sync** — products can be synced from Supabase (Postgres) into MongoDB.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- Tailwind CSS 4
- MongoDB (primary datastore), Supabase Postgres (product sync source)
- Stripe & Stripe Connect
- Cloudinary (media), Resend (email)
- react-simple-maps / d3-geo (US map visualizations)

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB database
- Accounts/keys for Stripe, Cloudinary, and Resend (see below)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` in the project root with the following variables:

   ```bash
   # Supabase (product sync script)
   SUPABASE_DATABASE_URL=

   # MongoDB
   MONGODB_URI=
   MONGODB_DBNAME=

   # Auth
   JWT_SECRET=

   # Environment
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # Stripe / Stripe Connect
   STRIPE_SECRET_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=

   # Email (Resend)
   RESEND_API_KEY=
   EMAIL_FROM=
   EMAIL_REPLY_TO=

   # OAuth providers
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   FACEBOOK_APP_ID=
   FACEBOOK_APP_SECRET=
   TWITTER_CLIENT_ID=
   TWITTER_CLIENT_SECRET=
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run sync:products` | Sync products from Supabase into MongoDB |

## Project Structure

```text
src/
├── app/
│   ├── (admin)/       # Admin dashboard (catalog, stores, users, claims, finance)
│   ├── (customers)/   # Customer-facing pages (shop, cart, checkout, orders, ...)
│   ├── (owner)/       # Store owner portal
│   ├── (info)/        # About, contact, and other info pages
│   ├── api/           # API routes (auth, products, stores, stripe, webhooks, ...)
│   ├── login/         # Login page
│   ├── signup/        # Customer signup (incl. OAuth)
│   ├── store-signup/  # Store owner signup
│   └── policies/      # Shipping, returns, refund, data protection
├── components/        # Shared UI (admin, customer, owner, chat, global)
├── context/           # React context providers
├── hooks/             # Custom hooks
├── lib/               # Server utilities (auth, db, stripe, email, sync, ...)
├── models/            # MongoDB data models
├── services/          # Client-side data services
└── types/             # Shared TypeScript types
scripts/               # One-off maintenance & sync scripts
```
