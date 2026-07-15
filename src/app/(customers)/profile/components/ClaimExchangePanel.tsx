"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";

type ExchangeVariant = { size: string | null; color: string | null; stock: number | null };

type ExchangeItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  currentVariant: string;
  hasVariants: boolean;
  sizes: string[];
  colors: string[];
  variants: ExchangeVariant[];
};

type Selection = { size?: string; color?: string };

export default function ClaimExchangePanel({
  claimId,
  onResolved,
}: {
  claimId: string;
  onResolved: () => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState<ExchangeItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  // Keyed by item index so multiple items of the same product stay independent.
  const [selections, setSelections] = useState<Record<number, Selection>>({});
  const [submitting, setSubmitting] = useState(false);
  // Collapsed by default so the chat stays visible; user expands to choose.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/claims/${claimId}/exchange`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (active) setItems(data.items ?? []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [claimId]);

  // Colors available for the size currently chosen on an item.
  function colorsForItem(item: ExchangeItem, size?: string) {
    if (!size) return item.colors;
    const forSize = item.variants
      .filter((v) => v.size != null && String(v.size) === String(size))
      .map((v) => v.color)
      .filter(Boolean) as string[];
    return forSize.length ? [...new Set(forSize)] : item.colors;
  }

  function pickSize(index: number, size: string, item: ExchangeItem) {
    setSelections((prev) => {
      const next = { ...prev[index], size };
      // Drop a color that no longer pairs with the new size.
      if (next.color && !colorsForItem(item, size).includes(next.color)) delete next.color;
      return { ...prev, [index]: next };
    });
  }

  function pickColor(index: number, color: string) {
    setSelections((prev) => ({ ...prev, [index]: { ...prev[index], color } }));
  }

  const ready =
    !!items &&
    items.every((it, idx) => {
      if (!it.hasVariants) return true;
      const sel = selections[idx];
      const needsSize = it.sizes.length > 0;
      const needsColor = it.colors.length > 0;
      if (needsSize && !sel?.size) return false;
      if (needsColor && !sel?.color) return false;
      return true;
    });

  async function submit() {
    if (!items || !ready) return;
    setSubmitting(true);
    try {
      const payload = {
        selections: items.map((it, idx) => ({
          productId: it.productId,
          size: selections[idx]?.size,
          color: selections[idx]?.color,
        })),
      };
      const res = await fetch(`/api/claims/${claimId}/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not submit your replacement. Please try again.");
        return;
      }
      toast.success("Replacement order confirmed. The store will ship your corrected item shortly.");
      onResolved();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-3 mt-3 rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 sm:mx-5">
      {/* Collapsible header — click to show/hide the replacement selector */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-purple-800 dark:text-purple-200">
            Choose the correct size / colour
          </span>
          <span className="mt-0.5 block text-[11px] text-purple-600 dark:text-purple-300">
            {expanded
              ? "Select the correct variant to place a replacement order. Your original order will be cancelled."
              : "Wrong item acknowledged — tap to select your replacement."}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-purple-600 transition-transform dark:text-purple-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {!expanded ? null : loading ? (
        <p className="px-4 pb-3 text-xs text-purple-500 dark:text-purple-300">Loading options…</p>
      ) : !items || items.length === 0 ? (
        <p className="px-4 pb-3 text-xs text-purple-500 dark:text-purple-300">No items to replace.</p>
      ) : (
        <div className="space-y-3 px-4 pb-3">
          {items.map((it, idx) => {
            const sel = selections[idx] ?? {};
            const availableColors = colorsForItem(it, sel.size);
            return (
              <div
                key={idx}
                className="rounded-lg border border-purple-100 bg-white p-3 dark:border-purple-900/40 dark:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.name} className="h-9 w-9 flex-shrink-0 rounded object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{it.name}</p>
                    {it.currentVariant && (
                      <p className="text-[10px] text-slate-400">Ordered: {it.currentVariant}</p>
                    )}
                  </div>
                </div>

                {!it.hasVariants ? (
                  <p className="mt-2 text-[11px] text-slate-400">
                    This product has no size/colour options — the store will resend the correct item.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {it.sizes.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Size</p>
                        <div className="flex flex-wrap gap-1.5">
                          {it.sizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => pickSize(idx, size, it)}
                              className={`min-w-[2rem] rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                                sel.size === size
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-purple-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {it.colors.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Colour</p>
                        <div className="flex flex-wrap gap-1.5">
                          {availableColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => pickColor(idx, color)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                sel.color === color
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-purple-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={submit}
            disabled={!ready || submitting}
            className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Replacement Order"}
          </button>
        </div>
      )}
    </div>
  );
}
