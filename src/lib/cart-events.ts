export function dispatchCartUpdate(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { count } }));
  }
}

export async function fetchAndUpdateCartCount(): Promise<void> {
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
