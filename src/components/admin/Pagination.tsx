"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** total item count — used for the "Showing X–Y of Z" label */
  totalItems?: number;
  pageSize?: number;
  className?: string;
};

/** Builds a compact page list with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12] */
function buildPages(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push("…");
  pages.push(pageCount);
  return pages;
}

export default function Pagination({ page, pageCount, onChange, totalItems, pageSize, className = "" }: Props) {
  if (pageCount <= 1) return null;
  const pages = buildPages(page, pageCount);

  const from = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to = pageSize && totalItems !== undefined ? Math.min(page * pageSize, totalItems) : undefined;

  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition";

  return (
    <div className={`flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row ${className}`}>
      {totalItems !== undefined && from !== undefined && to !== undefined ? (
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{from}</span>–
          <span className="font-semibold text-slate-700">{to}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalItems}</span>
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="px-1 text-sm text-slate-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`${btn} ${
                p === page
                  ? "border-[#58b8c3] bg-[#58b8c3] text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
