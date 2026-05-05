# Amstani & Co. - Backend Implementation Roadmap

This roadmap defines the structured phases for integrating the frontend UI with the MongoDB backend.

## Phase 1: Profiles & Store Onboarding (Current Phase)
**Goal:** Establish user identities and store foundations.
*   **Customer Profile:** Build API to fetch and update user profiles (addresses, phone numbers).
*   **Owner Settings:** Build API for owners to create and manage their `Store` profile (timings, branding). A store must exist before products can be added.

## Phase 2: Product Catalog
**Goal:** Enable commerce by managing inventory.
*   Build CRUD APIs for `Products`.
*   Connect Owner's `/products` page to add items, manage variants, and update stock.
*   Connect Customer's Home/Shop pages to fetch live products from the database.

## Phase 3: The Shopping Experience
**Goal:** Let customers interact with products.
*   Build the `Cart` API (Add to cart, update quantity, remove item).
*   Build the `Wishlist` API (Like/Unlike products).

## Phase 4: Checkout & Orders
**Goal:** The core commerce engine.
*   Build the checkout API to convert a `Cart` into an `Order`.
*   Set up the `FinanceLedger` entries to record the sale.
*   Connect Owner's `/orders` dashboard to see incoming purchases.

## Phase 5: Operations & Communications
**Goal:** Post-purchase ecosystem and administrative oversight.
*   Build the `Chat` and `Message` APIs for customer-owner communication.
*   Build the `Claim` API for dispute resolution.
*   Hook up the Admin Dashboard to oversee `FinanceLedger` and platform health.
