export type LiveStore = {
  id: number;
  img: string;
  name: string;
  live?: boolean;
  rating?: number | string;
  description?: string;
  state?: string;
  subscribers?: string;
};

export type BrowseStore = {
  id: number;
  name: string;
  description: string;
  state: string;
  badge: string;
  badgeColor: string;
  rating: string;
  img: string;
};

export type OnSaleStore = {
  id: number;
  name: string;
  img: string;
};

export type ActiveOrder = {
  id: string;
  status: string;
  detail: string;
  sub: string;
};

export const LIVE_STORES: LiveStore[] = [
  {
    id: 1,
    name: "Loom & Lane",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 2,
    name: "Velvet Harbor",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 3,
    name: "Thread Theory",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 4,
    name: "Maple Weave",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 5,
    name: "Indigo Nest",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 6,
    name: "Casa Cotton",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
    live: true,
  },
  {
    id: 7,
    name: "Urban Stitch",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=80&h=80&fit=crop",
    live: true,
  },
];

export const ON_SALE_STORES: OnSaleStore[] = [
  {
    id: 1,
    name: "Loom & Lane",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop",
  },
  {
    id: 2,
    name: "Velvet Harbor",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=60&h=60&fit=crop",
  },
  {
    id: 3,
    name: "Indigo Nest",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=60&h=60&fit=crop",
  },
];

export const BROWSE_STORES: BrowseStore[] = [
  {
    id: 1,
    name: "Loom & Lane",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "On Sale",
    badgeColor: "bg-red-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Velvet Harbor",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #1",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Thread Theory",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #1",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Maple Weave",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #5",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Indigo Nest",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "Ranked #6",
    badgeColor: "bg-teal-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Urban Stitch",
    description: "Description of the store can be written here",
    state: "Name of State",
    badge: "On Sale",
    badgeColor: "bg-red-500",
    rating: "5.4.9",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
  },
];

export const ACTIVE_ORDERS: ActiveOrder[] = [
  {
    id: "RAM-R621-8",
    status: "ACCEPTED",
    detail: "RAM-R054-C",
    sub: "Custom Work · Processing",
  },
];
