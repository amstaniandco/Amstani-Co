"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  FileText,
  Hammer,
  Heart,
  LayoutGrid,
  Map,
  MessageCircle,
  Moon,
  Music2,
  Package,
  Play,
  Radio,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Trophy,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { customerTutorialSteps, type CustomerTutorialStep } from "./customerTutorialSteps";

const STORAGE_KEY = "customer_tutorial_seen";

// ── Icon map ─────────────────────────────────────────────────────────────────

const STEP_ICONS: Record<string, LucideIcon> = {
  "welcome": Sparkles,
  "digital-mall": Building2,
  "broadcasting-room": Radio,
  "claim-store": Hammer,
  "dark-mode": Moon,
  "america-map": Map,
  "live-stores": Wifi,
  "categories": LayoutGrid,
  "browse-stores": Search,
  "disclaimer": AlertTriangle,
  "on-sale": Tag,
  "active-orders": Package,
  "notifications": Bell,
  "store-entry": Store,
  "store-hero": ShoppingBag,
  "music-toggle": Music2,
  "follow-btn": Heart,
  "live-chat": MessageCircle,
  "live-streams": Play,
  "store-form": FileText,
  "catalog": BookOpen,
  "our-products": BookOpen,
  "store-rating": Star,
  "finish": Trophy,
};

// ── Context ───────────────────────────────────────────────────────────────────

type TutorialCtx = {
  startTutorial: () => void;
  skipTutorial: () => void;
  isActive: boolean;
};

const TutorialContext = createContext<TutorialCtx | null>(null);

export function useCustomerTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useCustomerTutorial must be inside CustomerTutorialProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("token="));
}

async function fetchFirstStoreId(): Promise<string | null> {
  try {
    const res = await fetch("/api/stores/browse?limit=1");
    if (!res.ok) return null;
    const data = await res.json();
    return (data.stores?.[0]?._id as string) ?? null;
  } catch {
    return null;
  }
}

/** Returns the visible viewport rect of an element, or null if not visible. */
function getVisibleRect(el: HTMLElement): DOMRect | null {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = Math.max(r.top, 0);
  const left = Math.max(r.left, 0);
  const bottom = Math.min(r.bottom, vh);
  const right = Math.min(r.right, vw);
  const w = right - left;
  const h = bottom - top;
  if (w <= 0 || h <= 0) return null;
  return new DOMRect(left, top, w, h);
}

/** Finds the first VISIBLE element with the given tutorial-id. */
function findVisible(tutorialId: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(`[data-tutorial-id="${tutorialId}"]`);
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    // Element is visible if it has a non-zero rendered size
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

function computeCardPos(rect: DOMRect, cardW: number, cardH: number) {
  const GAP = 16;
  const MARGIN = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  let top = cy - cardH / 2;
  let left: number;

  if (vw - rect.right - GAP >= cardW) {
    left = rect.right + GAP;
  } else if (rect.left - GAP >= cardW) {
    left = rect.left - cardW - GAP;
  } else {
    left = cx - cardW / 2;
    if (vh - rect.bottom - GAP >= cardH) {
      top = rect.bottom + GAP;
    } else if (rect.top - GAP >= cardH) {
      top = rect.top - cardH - GAP;
    } else {
      top = MARGIN;
    }
  }

  top = Math.max(MARGIN, Math.min(vh - cardH - MARGIN, top));
  left = Math.max(MARGIN, Math.min(vw - cardW - MARGIN, left));
  return { top, left };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CustomerTutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navigatingRef = useRef(false);
  const freshNavRef = useRef(false);
  const storeIdRef = useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while active
  useEffect(() => {
    if (!isActive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isActive]);

  // Auto-start on first visit to landing page (logged-in users only)
  useEffect(() => {
    if (!mounted) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY) && pathname === "/" && isLoggedIn()) {
        const t = setTimeout(() => { setStepIndex(0); setIsActive(true); }, 1400);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [mounted, pathname]);

  const startTutorial = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    storeIdRef.current = null;
    setStepIndex(0);
    setIsActive(true);
    router.push("/");
  }, [router]);

  const finishTutorial = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIsActive(false);
      try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    }, 250);
  }, []);

  const skipTutorial = finishTutorial;

  const step: CustomerTutorialStep | undefined = customerTutorialSteps[stepIndex];

  // Resolve destination page for the current step
  function resolveStepPage(s: CustomerTutorialStep): string | null {
    if (s.page === "_store") {
      return storeIdRef.current ? `/store?storeId=${storeIdRef.current}` : null;
    }
    if (s.page === "_store-catalog") {
      return storeIdRef.current ? `/store/catalog?storeId=${storeIdRef.current}` : null;
    }
    return s.page ?? null;
  }

  function isOnCorrectPage(s: CustomerTutorialStep): boolean {
    if (s.page === "_store") return pathname.startsWith("/store") && !pathname.includes("/catalog");
    if (s.page === "_store-catalog") return pathname.startsWith("/store/catalog");
    if (s.page) return pathname === s.page;
    return true; // page: null = stay wherever
  }

  useEffect(() => {
    if (!isActive || !step) return;
    const s = step;
    setVisible(false);

    let cancelled = false;

    async function run() {
      // Fetch store ID on-demand when needed
      if ((s.page === "_store" || s.page === "_store-catalog") && !storeIdRef.current) {
        const id = await fetchFirstStoreId();
        if (cancelled) return;
        if (id) storeIdRef.current = id;
      }

      // Navigate if not on the correct page
      if (!isOnCorrectPage(s)) {
        if (!navigatingRef.current) {
          const dest = resolveStepPage(s);
          if (dest) {
            navigatingRef.current = true;
            freshNavRef.current = true;
            router.push(dest);
            return;
          }
        }
        return;
      }
      navigatingRef.current = false;

      // Consume the fresh-navigation flag so we know to wait longer
      const justNavigated = freshNavRef.current;
      freshNavRef.current = false;

      // Close mobile menu when leaving the notifications step
      if (s.id !== "notifications" && window.innerWidth < 768) {
        window.dispatchEvent(new CustomEvent("tutorial-close-mobile-menu"));
      }

      // For notifications step on mobile: open the hamburger menu first
      if (s.id === "notifications" && window.innerWidth < 768) {
        window.dispatchEvent(new CustomEvent("tutorial-open-mobile-menu"));
        await new Promise((r) => setTimeout(r, 500));
        if (cancelled) return;
      }

      // After a page navigation, wait for async data (e.g. ProductGrid) to load and settle layout
      await new Promise((r) => setTimeout(r, justNavigated ? 1400 : 300));
      if (cancelled) return;

      if (!s.target) {
        if (!cancelled) { setTargetRect(null); setCardPos(null); setVisible(true); }
        return;
      }

      // On mobile use mobile-specific notifications bell if available
      const resolvedId =
        s.id === "notifications" && window.innerWidth < 768
          ? "customer-notifications-bell-mobile"
          : s.target;

      let el = findVisible(resolvedId);
      // Fallback to original target if mobile-specific not found
      if (!el && resolvedId !== s.target) el = findVisible(s.target);

      if (!el) {
        if (!cancelled) { setTargetRect(null); setCardPos(null); setVisible(true); }
        return;
      }

      // Instant scroll into center, then wait 2 frames
      el.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled) return;

      const visRect = getVisibleRect(el);
      if (!visRect) {
        if (!cancelled) { setTargetRect(null); setCardPos(null); setVisible(true); }
        return;
      }

      if (!cancelled) {
        const CARD_W = Math.min(390, window.innerWidth - 24);
        setTargetRect(visRect);
        setCardPos(computeCardPos(visRect, CARD_W, 230));
        setVisible(true);
      }
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, isActive, pathname]);

  const goNext = useCallback(() => {
    if (stepIndex >= customerTutorialSteps.length - 1) finishTutorial();
    else setStepIndex((p) => p + 1);
  }, [stepIndex, finishTutorial]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex((p) => p - 1);
  }, [stepIndex]);

  const ctx = useMemo(
    () => ({ startTutorial, skipTutorial, isActive }),
    [startTutorial, skipTutorial, isActive]
  );

  const isCentered = !step?.target || !targetRect || !cardPos;

  return (
    <TutorialContext.Provider value={ctx}>
      {children}
      {mounted && isActive && step &&
        createPortal(
          <TutorialOverlay
            step={step}
            stepIndex={stepIndex}
            totalSteps={customerTutorialSteps.length}
            targetRect={targetRect}
            cardPos={cardPos}
            isCentered={isCentered}
            visible={visible}
            onNext={goNext}
            onBack={goBack}
            onSkip={skipTutorial}
          />,
          document.body
        )}
    </TutorialContext.Provider>
  );
}

// ── Overlay ───────────────────────────────────────────────────────────────────

type OverlayProps = {
  step: CustomerTutorialStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  cardPos: { top: number; left: number } | null;
  isCentered: boolean;
  visible: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

function TutorialOverlay({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  cardPos,
  isCentered,
  visible,
  onNext,
  onBack,
  onSkip,
}: OverlayProps) {
  const isLast = stepIndex === totalSteps - 1;
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const cardW = typeof window !== "undefined" ? Math.min(isMobile ? 340 : 390, window.innerWidth - 24) : 390;

  // Site teal palette
  const TEAL = "#68B8C1";
  const TEAL_DARK = "#3d9aa5";
  const TEAL_BG = "rgba(104,184,193,0.1)";
  const TEAL_BORDER = "rgba(104,184,193,0.25)";
  const TEAL_GLOW = "rgba(104,184,193,0.35)";

  const p = isMobile ? { h: 12, v: 14 } : { h: 16, v: 18 };

  const Icon = STEP_ICONS[step.id] ?? Sparkles;

  return (
    <>
      {/* Backdrop for centered steps */}
      {isCentered && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99990,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.28s ease",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Spotlight ring for targeted steps */}
      {!isCentered && targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            zIndex: 99991,
            borderRadius: 12,
            boxShadow: `0 0 0 9999px rgba(15,23,42,0.55), 0 0 0 2px ${TEAL}, 0 0 20px ${TEAL_GLOW}`,
            pointerEvents: "none",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.25s ease, top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease",
          }}
        />
      )}

      {/* Click blocker */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99992, pointerEvents: "all" }} />

      {/* Card */}
      <div
        style={{
          position: "fixed",
          zIndex: 99999,
          ...(isCentered
            ? {
                top: "50%", left: "50%",
                transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.92})`,
                width: `min(${isMobile ? 340 : 420}px, calc(100vw - 24px))`,
              }
            : {
                top: cardPos?.top ?? 0,
                left: cardPos?.left ?? 0,
                width: cardW,
                transform: `scale(${visible ? 1 : 0.94})`,
              }),
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease, transform 0.25s ease",
          pointerEvents: "all",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1.5px solid rgba(104,184,193,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(104,184,193,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Teal top accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${p.h}px ${p.v}px ${p.h - 2}px`,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: isMobile ? 30 : 34, height: isMobile ? 30 : 34,
                  borderRadius: 9,
                  background: TEAL_BG,
                  border: `1px solid ${TEAL_BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  color: TEAL_DARK,
                }}
              >
                <Icon size={isMobile ? 14 : 16} strokeWidth={1.8} />
              </div>
              <span
                style={{
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: TEAL,
                  fontFamily: "inherit",
                }}
              >
                Step {stepIndex + 1} of {totalSteps}
              </span>
            </div>

            <button
              type="button"
              onClick={onSkip}
              aria-label="Close tutorial"
              style={{
                width: 26, height: 26,
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#94a3b8",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, lineHeight: 1, flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: `${p.v - 2}px ${p.v}px 0` }}>
            <h3
              style={{
                fontSize: isMobile ? 14 : 15,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.35,
                margin: `0 0 ${isMobile ? 7 : 9}px`,
                letterSpacing: "-0.01em",
                fontFamily: "inherit",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: isMobile ? 12 : 13,
                color: "#475569",
                lineHeight: 1.65,
                margin: 0,
                fontFamily: "inherit",
              }}
            >
              {step.description}
            </p>
          </div>

          {/* Progress */}
          <div style={{ padding: `${isMobile ? 12 : 15}px ${p.v}px 0` }}>
            <div
              style={{
                height: 3,
                borderRadius: 99,
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`,
                  borderRadius: 99,
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${isMobile ? 9 : 11}px ${p.v}px ${isMobile ? 12 : 14}px`,
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={onSkip}
              style={{
                fontSize: 11, color: "#94a3b8",
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 0", fontFamily: "inherit",
              }}
            >
              {isLast ? "" : "Skip"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    height: isMobile ? 30 : 33, paddingLeft: 12, paddingRight: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                    cursor: "pointer", fontSize: 11, fontWeight: 600,
                    fontFamily: "inherit", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                type="button"
                onClick={onNext}
                style={{
                  height: isMobile ? 30 : 33, paddingLeft: isMobile ? 14 : 18, paddingRight: isMobile ? 14 : 18,
                  borderRadius: 8,
                  border: "none",
                  background: TEAL,
                  color: "#ffffff",
                  fontWeight: 700, fontSize: isMobile ? 11 : 12,
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center",
                  whiteSpace: "nowrap",
                  boxShadow: `0 3px 12px ${TEAL_GLOW}`,
                }}
              >
                {isLast ? "Start exploring!" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
