export type TutorialStep = {
  /** data-tutorial-id of element to spotlight. null = stays centered (no slide animation). */
  target: string | null;
  title: string;
  description: string;
  /** Which owner route this step lives on */
  page: string;
  /** Tooltip placement relative to spotlight */
  position?: "top" | "bottom" | "left" | "right";
  /**
   * data-tutorial-id of element to click after user presses Next on THIS step.
   * Used to auto-open modals (e.g. opening the first claim row) before showing the NEXT step.
   */
  postAction?: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    page: "/owner/profile",
    target: null,
    title: "Welcome to Your Store Owner Panel!",
    description:
      "Let's take a quick tour of every feature. You can skip at any time and replay from your Profile page using the 'See Tutorial' button.",
  },
  {
    page: "/owner/profile",
    target: "owner-banner",
    title: "Store Banner",
    description:
      "Click the pencil icon on your banner to upload a wide cover image. This is the first thing customers see when they visit your store.",
    position: "bottom",
  },
  {
    page: "/owner/profile",
    target: "owner-logo",
    title: "Store Logo",
    description:
      "Upload your store logo — it appears as your profile picture on listings, search results, and the public store page.",
    position: "right",
  },
  {
    page: "/owner/profile",
    target: "owner-profile-checklist",
    title: "Profile Completion Checklist",
    description:
      "Your store won't be visible to customers until every item here is checked. Fill in name, description, logo, banner, and languages to go live.",
    position: "top",
  },
  {
    page: "/owner/profile",
    target: "owner-store-customization",
    title: "Store Customization",
    description:
      "Set your store name, description, contact email, phone, and languages spoken. Customers see all this on your public store page.",
    position: "top",
  },
  {
    page: "/owner/profile",
    target: "owner-user-preview",
    title: "User Preview",
    description:
      "Click 'User Preview' to see exactly how your store looks to customers — great for checking your banner, logo, and description before going live.",
    position: "left",
  },
  {
    page: "/owner/profile",
    target: "sidebar-products",
    title: "Sidebar — Products",
    description:
      "Use the sidebar to navigate. Next we'll explore the Products page where you manage everything listed in your store.",
    position: "right",
  },

  // ── Products ──────────────────────────────────────────────────────────────
  {
    page: "/products",
    target: null,
    title: "Your Products",
    description:
      "This page lists every product currently live in your store. You can view details, adjust pricing, toggle sales and new-arrival flags, and monitor stock.",
  },
  {
    page: "/products",
    target: "owner-products-section",
    title: "Product List & Filters",
    description:
      "Search by name or filter by category, brand, sale status, new-arrival flag, or stock level. Click 'Details' on any row to see the full pricing breakdown.",
    position: "top",
  },
  {
    page: "/products",
    target: "owner-add-products-btn",
    title: "Add Products",
    description:
      "Click here to open the product catalog and add new items to your store. You can set your own quantity and the system applies platform pricing rules.",
    position: "bottom",
  },
  {
    page: "/products",
    target: "sidebar-orders",
    title: "Sidebar — Orders",
    description:
      "When customers place orders in your store they appear here in real time. Let's head to Orders next.",
    position: "right",
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  {
    page: "/orders",
    target: null,
    title: "Customer Orders",
    description:
      "Every purchase made in your store shows up here. You can accept, dispatch, mark as shipped, or put orders on hold.",
  },
  {
    page: "/orders",
    target: "owner-orders-filters",
    title: "Order Status Filters",
    description:
      "Quickly filter orders by status: Incoming, Accepted, Rejected, On Hold, Dispatched, Shipped, or Delivered. Active filters are highlighted.",
    position: "bottom",
  },
  {
    page: "/orders",
    target: "owner-orders-list",
    title: "Order Cards",
    description:
      "Each card shows the customer, items ordered, total value, and current status. Click an order to open its detail and take action.",
    position: "top",
  },
  {
    page: "/orders",
    target: "sidebar-claims",
    title: "Sidebar — Claims",
    description:
      "If a customer has an issue with their order they raise a Claim. Let's see how to handle them.",
    position: "right",
  },

  // ── Claims ────────────────────────────────────────────────────────────────
  {
    page: "/owner/claims",
    target: null,
    title: "Customer Claims",
    description:
      "When customers report a problem with their order — damaged item, wrong product, missing parcel — they submit a Claim here for you to respond and resolve.",
  },
  {
    page: "/owner/claims",
    target: "owner-claims-stats",
    title: "Claims Stats",
    description:
      "Quick overview: total claims and any escalated ones. Escalated claims have been passed to admin — handle them promptly to avoid account penalties.",
    position: "bottom",
  },
  {
    page: "/owner/claims",
    target: "owner-claims-table",
    title: "Claims Table",
    description:
      "Each row shows claim ID, customer, issue type, due date, and status. A red badge means there are unread customer messages. Click 'View / Chat' to open a claim.",
    position: "top",
    postAction: "owner-first-claim-btn",
  },
  {
    page: "/owner/claims",
    target: "owner-claim-chat",
    title: "Claim Conversation",
    description:
      "This is the full message thread between you and the customer. Read through their description and photos to understand the issue before responding.",
    position: "top",
  },
  {
    page: "/owner/claims",
    target: "owner-claim-input",
    title: "Reply to Customer",
    description:
      "Type your response here and press Send (or Enter). Keep replies professional and helpful — your response time and tone affect your store rating.",
    position: "top",
  },
  {
    page: "/owner/claims",
    target: "owner-claim-resolve-area",
    title: "Resolve the Claim",
    description:
      "When the issue is settled, click 'Request Admin Approval to Resolve'. Admin reviews the conversation and approves the resolution, which closes the claim.",
    position: "top",
  },
  {
    page: "/owner/claims",
    target: "sidebar-chats",
    title: "Sidebar — Chats",
    description:
      "Use the Chats section to message the Amstani admin team directly and to handle customer enquiries outside of formal claims.",
    position: "right",
  },

  // ── Chats ─────────────────────────────────────────────────────────────────
  {
    page: "/chats",
    target: null,
    title: "Store Chats",
    description:
      "Two chat channels: one with the Amstani admin team and one for direct customer messages. Keep your conversations up to date for the best store rating.",
  },
  {
    page: "/chats",
    target: "owner-chats-section",
    title: "Chat Panel",
    description:
      "Select 'Admin' to contact the platform team or pick a customer thread from the list on the left. New unread messages show a red dot on the sidebar badge.",
    position: "top",
  },
  {
    page: "/chats",
    target: "sidebar-notifications",
    title: "Sidebar — Notifications",
    description:
      "Important platform alerts — promotions expiring, policy updates, admin messages — all land in Notifications.",
    position: "right",
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  {
    page: "/owner/notifications",
    target: "owner-notifications-section",
    title: "Notifications",
    description:
      "System alerts and admin announcements appear here. Unread count shows on the sidebar badge. Check this regularly to stay on top of platform news.",
    position: "top",
  },
  {
    page: "/owner/notifications",
    target: "sidebar-communications",
    title: "Sidebar — Communications",
    description:
      "Manage automated email templates and send push notifications to your store followers. Let's see what's there.",
    position: "right",
  },

  // ── Communications ────────────────────────────────────────────────────────
  {
    page: "/communications",
    target: null,
    title: "Communications",
    description:
      "Two powerful tools: automated email triggers for transaction events, and store announcements you can push to all your followers at once.",
  },
  {
    page: "/communications",
    target: "owner-communications-templates",
    title: "Email Templates",
    description:
      "Toggle automated emails on or off for events like order confirmation, dispatch, or delivery. Each card shows the trigger condition and what the email does.",
    position: "top",
  },
  {
    page: "/communications",
    target: "owner-communications-announcements",
    title: "Store Announcements",
    description:
      "Send a push notification to every follower of your store. Great for sales, new arrivals, or special events. Followers receive it in their notification centre.",
    position: "top",
  },
  {
    page: "/communications",
    target: "sidebar-timings",
    title: "Sidebar — Timings",
    description:
      "Set the hours your store is actively 'live' so customers know when you're available. Let's visit Timings next.",
    position: "right",
  },

  // ── Timings ───────────────────────────────────────────────────────────────
  {
    page: "/timings",
    target: null,
    title: "Store Timings",
    description:
      "Set the hours when your store is live and broadcasting. Customers can see when you're online and your GoLive session is recorded for performance tracking.",
  },
  {
    page: "/timings",
    target: "owner-timings-section",
    title: "Live Hours & Sessions",
    description:
      "Set your 'From' and 'To' times and click Save. Each live session is logged. You get warning points if you go live outside your declared hours — keep them accurate!",
    position: "top",
  },
  {
    page: "/timings",
    target: "sidebar-performance",
    title: "Sidebar — Performance",
    description:
      "Track your revenue, visitor count, conversions, and best-selling products over time.",
    position: "right",
  },

  // ── Performance ───────────────────────────────────────────────────────────
  {
    page: "/performance",
    target: null,
    title: "Store Performance",
    description:
      "Your store analytics dashboard. Monitor revenue trends, visitor numbers, conversion rates, and see which products are selling best.",
  },
  {
    page: "/performance",
    target: "owner-performance-section",
    title: "Revenue & Metrics",
    description:
      "Key metrics at a glance: revenue change, visits, and conversion rate compared to the previous period. Use these to decide when to run sales or add new products.",
    position: "top",
  },
  {
    page: "/performance",
    target: "sidebar-music",
    title: "Sidebar — Music",
    description:
      "Upload background tracks that play in your store for a unique shopping atmosphere.",
    position: "right",
  },

  // ── Music ─────────────────────────────────────────────────────────────────
  {
    page: "/music",
    target: null,
    title: "Store Music",
    description:
      "Upload MP3 tracks that play as background music when customers browse your store. A unique touch that sets your brand apart.",
  },
  {
    page: "/music",
    target: "owner-music-section",
    title: "Music Player",
    description:
      "Upload MP3 files here. You can add multiple tracks and they'll loop while customers shop. Keep tracks relevant and tasteful to enhance the shopping experience.",
    position: "top",
  },
  {
    page: "/music",
    target: "sidebar-payouts",
    title: "Sidebar — Payouts",
    description:
      "Connect your Stripe account to receive payments from customer orders directly.",
    position: "right",
  },

  // ── Payouts ───────────────────────────────────────────────────────────────
  {
    page: "/owner/stripe",
    target: null,
    title: "Payouts — Stripe",
    description:
      "Connect your Stripe account to receive order payouts. Stripe handles all payment processing securely — you get paid directly to your bank account.",
  },
  {
    page: "/owner/stripe",
    target: "owner-payouts-section",
    title: "Stripe Connection",
    description:
      "Click 'Connect with Stripe' to link your bank account. Once connected, every order payout is transferred automatically after a short clearing period.",
    position: "top",
  },

  // ── Done ──────────────────────────────────────────────────────────────────
  {
    page: "/owner/stripe",
    target: null,
    title: "You're All Set! 🎉",
    description:
      "You've completed the full tour of your store owner panel. Head back to your Profile page any time and click 'See Tutorial' to replay it.",
  },
];
