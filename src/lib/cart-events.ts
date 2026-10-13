import { getGuestCart, hasActiveSession } from "./guest-shopping";

export function dispatchCartUpdate(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { count } }));
  }
}

export async function fetchAndUpdateCartCount(): Promise<void> {
  if (!hasActiveSession()) {
    dispatchCartUpdate(getGuestCart().reduce((sum, item) => sum + item.quantity, 0));
    return;
  }
  try {
    const res = await fetch("/api/cart");
    if (!res.ok) return;
    const data = await res.json();
    const count = Array.isArray(data.items)
      ? data.items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 1), 0)
      : 0;
    dispatchCartUpdate(count);
  } catch {}
}
