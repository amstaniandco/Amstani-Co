export type TutorialStep = {
  /** data-tutorial-id of the element to spotlight. null = centered modal (no spotlight). */
  target: string | null;
  title: string;
  description: string;
  /** Which owner route this step lives on */
  page: string;
  /** Tooltip placement relative to spotlight */
  position?: "top" | "bottom" | "left" | "right";
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ── Profile Page ─────────────────────────────────────────────────────────
  {
    page: "/owner/profile",
    target: null,
    title: "Welcome to Your Store Panel!",
    description:
      "Let's take a quick tour of all the key features. You can skip at any time and replay this tutorial using the 'See Tutorial' button on your profile page.",
  },
  {
    page: "/owner/profile",
    target: "owner-banner",
    title: "Store Banner",
    description:
      "Upload an eye-catching banner for your store. Click the pencil icon on the banner to upload a photo.",
    position: "bottom",
  },
  {
    page: "/owner/profile",
    target: "owner-logo",
    title: "Store Logo",
    description:
      "Upload your store logo — it appears as your profile picture on store listings and the public store page.",
    position: "right",
  },
  {
    page: "/owner/profile",
    target: "owner-profile-checklist",
    title: "Profile Completion Checklist",
    description:
      "Your store won't be visible to customers until every item here is filled in and an admin activates your account. Complete all fields to go live!",
    position: "top",
  },
  {
    page: "/owner/profile",
    target: "owner-store-customization",
    title: "Store Customization",
    description:
      "Set your store name, description, contact details, and the languages you speak. Customers can see all of this on your public store page.",
    position: "top",
  },
  {
    page: "/owner/profile",
    target: "sidebar-products",
    title: "Sidebar — Products",
    description:
      "Use the sidebar to navigate between sections. Next we'll explore your Products page where you manage everything you sell.",
    position: "right",
  },

  // ── Products Page ─────────────────────────────────────────────────────────
  {
    page: "/products",
    target: null,
    title: "Your Products",
    description:
      "This page lists all products currently live in your store. You can adjust prices, toggle sales, and check stock here.",
  },
  {
    page: "/products",
    target: "owner-products-section",
    title: "Product List & Filters",
    description:
      "Search by name, or filter by category, brand, sale status, new-arrival flag, and stock level. Click 'Details' on any row for the full product breakdown.",
    position: "top",
  },
  {
    page: "/products",
    target: "sidebar-orders",
    title: "Sidebar — Orders",
    description:
      "When customers purchase from your store, their orders appear in the Orders section. Let's head there next.",
    position: "right",
  },

  // ── Orders Page ───────────────────────────────────────────────────────────
  {
    page: "/orders",
    target: null,
    title: "Customer Orders",
    description:
      "All orders placed in your store appear here in real time. You can accept, dispatch, or update each order's status.",
  },
  {
    page: "/orders",
    target: "owner-orders-list",
    title: "Order List",
    description:
      "Each card shows the customer, items ordered, total price, and current status. Click any order to open it, view details, and take action.",
    position: "top",
  },
  {
    page: "/orders",
    target: "sidebar-claims",
    title: "Sidebar — Claims",
    description:
      "If a customer has an issue with their order they'll raise a Claim. Let's see how to handle them.",
    position: "right",
  },

  // ── Claims Page ───────────────────────────────────────────────────────────
  {
    page: "/owner/claims",
    target: null,
    title: "Customer Claims",
    description:
      "When customers have a problem with their order they submit a claim here. You'll see all open and resolved claims for your store.",
  },
  {
    page: "/owner/claims",
    target: "owner-claims-table",
    title: "Claims Table",
    description:
      "Each row shows the claim number, customer, order, status, and a red badge if there are unread messages. Click a row to open the claim and respond.",
    position: "top",
  },

  // ── Done ──────────────────────────────────────────────────────────────────
  {
    page: "/owner/claims",
    target: null,
    title: "You're All Set! 🎉",
    description:
      "You now know the key features of your store panel. Head to your Profile page any time to replay this tutorial by clicking 'See Tutorial'.",
  },
];
