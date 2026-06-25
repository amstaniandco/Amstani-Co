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
    title: "",
    description:
      "Welcome to Amstani & Co, where scrolling turns into shopping, shopping turns into obsession, and your cart somehow fills itself!",
    page: "/",
    target: null,
  },
  {
    id: "digital-mall",
    title: "",
    description: "Featured stores stealing the spotlight. ✨",
    page: "/",
    target: "customer-digital-mall",
  },
  {
    id: "broadcasting-room",
    title: "",
    description:
      "Someone's live, someone's selling, and you're missing the fun. Sign up/in to join the party.",
    page: "/",
    target: "customer-broadcasting-room",
  },
  {
    id: "claim-store",
    title: "",
    description:
      "Skip the factory. Skip the designing drama. Just get a store and start selling. (To reserve a store in our digital mall, get in-touch with one of the stores in your state).",
    page: "/",
    target: "customer-claim-store",
  },
  {
    id: "dark-mode",
    title: "",
    description:
      "Now buckle up, switch to dark mode, hop in your cart and start collecting the treasure.",
    page: null,
    target: "customer-dark-mode-toggle",
  },
  {
    id: "america-map",
    title: "",
    description:
      "Choose your state and let the shopping adventure begin after the sign up/in.",
    page: "/",
    target: "customer-america-map",
  },
  {
    id: "live-stores",
    title: "",
    description: "Live stores. Exclusive deals. Zero FOMO.",
    page: "/home",
    target: "customer-live-stores",
  },
  {
    id: "categories",
    title: "",
    description:
      "The good stuff from every store, all hanging out in one place.",
    page: "/home",
    target: "customer-categories",
  },
  {
    id: "browse-stores",
    title: "",
    description:
      "The best finds from all stores across your state, no road trip required!",
    page: "/home",
    target: "customer-browse-stores",
  },
  {
    id: "disclaimer",
    title: "",
    description:
      "**DISCLAIMER:** Every store puts its own spin on the shopping experience. Same product. Different stores. Different deals. That's the fun of the mall. Take a stroll, compare offers, and see who wins your cart.",
    page: "/home",
    target: null,
  },
  {
    id: "on-sale",
    title: "",
    description: "Stores that are feeling generous today 😉",
    page: "/home",
    target: "customer-on-sale",
  },
  {
    id: "active-orders",
    title: "",
    description:
      "Wondering where your order is? Here's where you can follow yours.",
    page: "/home",
    target: "customer-active-orders",
  },
  {
    id: "notifications",
    title: "",
    description:
      "Your favorite stores have news. Good thing you're following them.",
    page: null,
    target: "customer-notifications-bell",
  },
  {
    id: "store-entry",
    title: "",
    description: "Well, well, well... look who just came in.",
    page: "_store",
    target: null,
  },
  {
    id: "store-hero",
    title: "",
    description:
      "Glad you stopped by. Now grab a virtual shopping basket and make yourself comfortable.",
    page: null,
    target: "customer-store-hero",
  },
  {
    id: "music-toggle",
    title: "",
    description:
      "Love the shopping, not the soundtrack? Turn it off anytime.",
    page: null,
    target: "customer-music-toggle",
  },
  {
    id: "follow-btn",
    title: "",
    description: "Following this store? That's a pretty good idea.",
    page: null,
    target: "customer-follow-btn",
  },
  {
    id: "live-chat",
    title: "",
    description:
      "Why guess when you can ask? Chat or call the store and get the inside scoop.",
    page: null,
    target: "customer-live-chat",
  },
  {
    id: "live-streams",
    title: "",
    description: "Less scrolling. More discovering. Join the live.",
    page: null,
    target: "customer-live-streams",
  },
  {
    id: "store-form",
    title: "",
    description: "Ready to join the mall? Start with the form.",
    page: null,
    target: "customer-store-form",
  },
  {
    id: "catalog",
    title: "",
    description:
      "Spotted something you love in the Amstani & Co Catalog? Don't just stare at it. Screenshot it, send it to your favorite store, and ask them to bring it in for you. And hey, check a few stores while you're at it as prices can vary, and the best deal might be hanging out next door.",
    page: null,
    target: "customer-store-catalog",
  },
  {
    id: "our-products",
    title: "",
    description:
      "**Good news:** These products aren't stuck on a boat somewhere. They're already in stock, right here in the USA, and ready to head your way.",
    page: "_store-catalog",
    target: "customer-store-catalog",
  },
  {
    id: "store-rating",
    title: "",
    description:
      "Your feedback is kind of a big deal. Use it to launch your favorite store to the top!",
    page: "_store",
    target: "customer-store-rating",
  },
  {
    id: "finish",
    title: "",
    description:
      "Alright, champ. The mall's all yours. Go poke around, wander freely. We hid the good stuff everywhere!",
    page: null,
    target: null,
  },
];
