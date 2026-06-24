export type CustomerTutorialStep = {
  id: string;
  title: string;
  description: string;
  /** Static path, '_store' (navigate to fetched store), '_store-catalog' (store catalog), or null (stay) */
  page: string | "_store" | "_store-catalog" | null;
  target: string | null;
};

export const customerTutorialSteps: CustomerTutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Amstani & Co.",
    description:
      "The first digital mall where real local stores meet real online shoppers. Get ready — your smart shopping journey starts now.",
    page: "/",
    target: null,
  },
  {
    id: "digital-mall",
    title: "Featured stores stealing the spotlight.",
    description:
      "The digital mall showcases top stores ready to wow you. Browse, explore, and find your next favorite spot — all in one place.",
    page: "/",
    target: "customer-digital-mall",
  },
  {
    id: "broadcasting-room",
    title: "Someone's live, someone's selling...",
    description:
      "The Broadcasting Room is where stores go live. Catch real-time drops, exclusive deals, and live interactions — straight from the source.",
    page: "/",
    target: "customer-broadcasting-room",
  },
  {
    id: "claim-store",
    title: "Skip the factory. Shop the maker.",
    description:
      "Every store here is run by a real person, not a warehouse. Real products. Real stories. Real people behind every order.",
    page: "/",
    target: "customer-claim-store",
  },
  {
    id: "dark-mode",
    title: "Switch to dark mode, anytime.",
    description:
      "Easier on the eyes, harder to put down. Hit this button to flip between light and dark mode — your vibe, your rules.",
    page: null,
    target: "customer-dark-mode-toggle",
  },
  {
    id: "america-map",
    title: "Choose your state. Own your mall.",
    description:
      "See stores near you by selecting your state on the map. Every region has its own hidden gems — yours is waiting.",
    page: "/",
    target: "customer-america-map",
  },
  {
    id: "live-stores",
    title: "Live stores. Exclusive deals. Zero FOMO.",
    description:
      "These stores are live right now. Jump in, ask questions, snag deals before they're gone. The early shopper gets the good stuff.",
    page: "/home",
    target: "customer-live-stores",
  },
  {
    id: "categories",
    title: "The good stuff from every store, sorted.",
    description:
      "Browse by category and zero in on exactly what you're after. Fashion, home, food, beauty — all organized and ready.",
    page: "/home",
    target: "customer-categories",
  },
  {
    id: "browse-stores",
    title: "The best finds from all stores, one scroll.",
    description:
      "Discover stores from across the country, filtered to your state. Every card is a doorway to something worth checking out.",
    page: "/home",
    target: "customer-browse-stores",
  },
  {
    id: "disclaimer",
    title: "Quick heads-up before you shop.",
    description:
      "Every store puts its own spin on things — descriptions, quality, and prices may vary. Always check the store's policies. Prices also vary by state taxes and store markup.",
    page: "/home",
    target: null,
  },
  {
    id: "on-sale",
    title: "Stores feeling generous today.",
    description:
      "These stores are running deals right now. The discounts are real, the stock is limited, and the window is short — go.",
    page: "/home",
    target: "customer-on-sale",
  },
  {
    id: "active-orders",
    title: "Wondering where your order is?",
    description:
      "Your active orders live right here. Track status, check details, and stay in the loop without hunting through your inbox.",
    page: "/home",
    target: "customer-active-orders",
  },
  {
    id: "notifications",
    title: "Your favorite stores have news for you.",
    description:
      "Every new drop, sale, and update from stores you follow lands right here. Turn on notifications and never miss a moment.",
    page: null,
    target: "customer-notifications-bell",
  },
  {
    id: "store-entry",
    title: "Well, well, well... look who just came in.",
    description:
      "You just walked into a store. From here, every click is an adventure — products, live chat, music, ratings. Take it all in.",
    page: "_store",
    target: null,
  },
  {
    id: "store-hero",
    title: "Glad you stopped by. Now let's explore.",
    description:
      "The store banner, profile, follower count, rankings — everything that tells you who this store is at a glance.",
    page: null,
    target: "customer-store-hero",
  },
  {
    id: "music-toggle",
    title: "Love the shopping, not the soundtrack?",
    description:
      "Some stores play music while you browse. If it's not your vibe, mute it here. Your ears, your call.",
    page: null,
    target: "customer-music-toggle",
  },
  {
    id: "follow-btn",
    title: "Following this store? You probably should.",
    description:
      "Hit Follow and you'll get updates every time this store goes live, drops something new, or runs a sale.",
    page: null,
    target: "customer-follow-btn",
  },
  {
    id: "live-chat",
    title: "Why guess when you can just ask?",
    description:
      "Talk directly to the store owner. Ask about sizes, availability, custom orders — real answers, not a chatbot.",
    page: null,
    target: "customer-live-chat",
  },
  {
    id: "live-streams",
    title: "Less scrolling. More discovering.",
    description:
      "Join the store's live streams on Instagram, Facebook, TikTok or WhatsApp. Watch products in action before you buy.",
    page: null,
    target: "customer-live-streams",
  },
  {
    id: "store-form",
    title: "Ready to join the mall?",
    description:
      "Got a store or a dream of one? Fill out this form to apply for your spot in the Amstani & Co digital mall. We'd love to have you.",
    page: null,
    target: "customer-store-form",
  },
  {
    id: "catalog",
    title: "Spotted something you love in the catalog?",
    description:
      "The Amstani & Co catalog is the master list of products available across all stores. Find it here, then buy it from a store near you.",
    page: null,
    target: "customer-store-catalog",
  },
  {
    id: "our-products",
    title: "Browse the full catalog — right in this store.",
    description:
      "Every product in the Amstani & Co catalog is here. Search, filter, and find exactly what you want — then add it straight to your cart.",
    page: "_store-catalog",
    target: "customer-store-catalog",
  },
  {
    id: "store-rating",
    title: "Your feedback is kind of a big deal.",
    description:
      "Ratings help real shoppers find great stores — and push stores to keep their game up. Leave a review. It takes 10 seconds and means everything.",
    page: "_store",
    target: "customer-store-rating",
  },
  {
    id: "finish",
    title: "Alright, champ. The mall's all yours.",
    description:
      "You've seen what Amstani & Co is all about. Now go explore, shop local, and support real stores doing real things. Happy shopping!",
    page: null,
    target: null,
  },
];
