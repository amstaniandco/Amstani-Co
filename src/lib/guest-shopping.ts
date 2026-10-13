export const GUEST_CART_STORAGE_KEY = "amstani:guest-cart";
export const GUEST_WISHLIST_STORAGE_KEY = "amstani:guest-wishlist";

export type GuestShoppingItem = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  originalPrice?: number;
  weightKg?: number;
  mainImage?: string | null;
  quantity: number;
  selectedVariants?: Record<string, string>;
  customOrderDetails?: { description: string; mediaUrls: string[] };
  maxQuantity?: number;
};

export type GuestWishlistItem = Omit<GuestShoppingItem, "quantity" | "selectedVariants" | "customOrderDetails">;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function variantKey(selectedVariants?: Record<string, string>) {
  return JSON.stringify(Object.entries(selectedVariants ?? {}).sort(([a], [b]) => a.localeCompare(b)));
}

export function hasActiveSession() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((entry) => entry.trim().startsWith("token="));
}

export function getGuestCart() {
  return read<GuestShoppingItem>(GUEST_CART_STORAGE_KEY);
}

export type GuestCartAddResult = "added" | "capped" | "out_of_stock";

export function addGuestCartItem(item: GuestShoppingItem): GuestCartAddResult {
  const items = getGuestCart();
  const maxQuantity = item.maxQuantity == null ? Infinity : Math.max(0, item.maxQuantity);
  const index = item.customOrderDetails
    ? -1
    : items.findIndex((existing) =>
        existing.productId === item.productId &&
        existing.storeId === item.storeId &&
        variantKey(existing.selectedVariants) === variantKey(item.selectedVariants)
      );

  if (index >= 0) {
    const currentQuantity = items[index].quantity;
    const requestedQuantity = currentQuantity + item.quantity;
    const nextQuantity = Math.min(maxQuantity, requestedQuantity);
    if (nextQuantity <= currentQuantity) return "out_of_stock";
    items[index] = { ...items[index], quantity: nextQuantity };
    write(GUEST_CART_STORAGE_KEY, items);
    return nextQuantity < requestedQuantity ? "capped" : "added";
  } else {
    const quantity = Math.min(maxQuantity, Math.max(1, item.quantity));
    if (quantity <= 0) return "out_of_stock";
    items.push({ ...item, quantity });
    write(GUEST_CART_STORAGE_KEY, items);
    return quantity < item.quantity ? "capped" : "added";
  }
}

export function updateGuestCartItem(index: number, quantity: number) {
  const items = getGuestCart();
  if (quantity <= 0) items.splice(index, 1);
  else if (items[index]) {
    const maxQuantity = items[index].maxQuantity == null ? Infinity : Math.max(0, items[index].maxQuantity);
    items[index] = { ...items[index], quantity: Math.min(maxQuantity, quantity) };
  }
  write(GUEST_CART_STORAGE_KEY, items);
}

export function removeGuestCartItem(index: number) {
  const items = getGuestCart();
  items.splice(index, 1);
  write(GUEST_CART_STORAGE_KEY, items);
}

export function clearGuestCart() {
  write<GuestShoppingItem>(GUEST_CART_STORAGE_KEY, []);
}

export function getGuestWishlist() {
  return read<GuestWishlistItem>(GUEST_WISHLIST_STORAGE_KEY);
}

export function toggleGuestWishlist(item: GuestWishlistItem) {
  const items = getGuestWishlist();
  const index = items.findIndex((existing) => existing.productId === item.productId && existing.storeId === item.storeId);
  if (index >= 0) items.splice(index, 1);
  else items.push(item);
  write(GUEST_WISHLIST_STORAGE_KEY, items);
  return index < 0;
}

export function removeGuestWishlistItem(productId: string, storeId: string) {
  write(GUEST_WISHLIST_STORAGE_KEY, getGuestWishlist().filter((item) => item.productId !== productId || item.storeId !== storeId));
}

export function clearGuestWishlist() {
  write<GuestWishlistItem>(GUEST_WISHLIST_STORAGE_KEY, []);
}

export async function syncGuestShopping() {
  if (typeof window === "undefined") return;

  const cart = getGuestCart();
  const remainingCart: GuestShoppingItem[] = [];
  for (const item of cart) {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!response.ok) remainingCart.push(item);
  }
  write(GUEST_CART_STORAGE_KEY, remainingCart);

  const wishlist = getGuestWishlist();
  const existingResponse = await fetch("/api/wishlist");
  const existingData = existingResponse.ok ? await existingResponse.json() : { items: [] };
  const existingKeys = new Set((existingData.items ?? []).map((item: GuestWishlistItem) => `${item.productId}:${item.storeId}`));
  const remainingWishlist: GuestWishlistItem[] = [];
  for (const item of wishlist) {
    if (existingKeys.has(`${item.productId}:${item.storeId}`)) continue;
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!response.ok) remainingWishlist.push(item);
  }
  write(GUEST_WISHLIST_STORAGE_KEY, remainingWishlist);
}