"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Reads `?highlight=<id>` from the URL and, once the matching row is in the DOM,
 * scrolls it into view and flashes a highlight animation. Rows opt in by rendering
 * a `data-row-id="<id>"` attribute.
 *
 * @param ready  pass your page's "data loaded" flag so the search starts after rows render.
 */
export function useHighlightRow(ready: boolean = true) {
  const params = useSearchParams();
  const highlight = params.get("highlight");

  useEffect(() => {
    if (!highlight || !ready) return;
    let cancelled = false;
    let tries = 0;

    const find = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(highlight)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("admin-row-highlight");
        setTimeout(() => el.classList.remove("admin-row-highlight"), 2800);
      } else if (tries++ < 25) {
        setTimeout(find, 200);
      }
    };

    const t = setTimeout(find, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [highlight, ready]);
}
