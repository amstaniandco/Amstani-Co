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
// Persist in-progress state so the tutorial survives navigation away from the
// app (e.g. the login page or the OAuth full-page redirect) and resumes where
// it left off — notably step 7 (live-stores) which only appears after sign-in.
const PROGRESS_KEY = "customer_tutorial_progress";

type TutorialProgress = { active: boolean; step: number };

function readProgress(): TutorialProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TutorialProgress>;
    if (typeof parsed.step !== "number" || typeof parsed.active !== "boolean") return null;
    return { active: parsed.active, step: parsed.step };
  } catch {
    return null;
  }
}

function writeProgress(progress: TutorialProgress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function clearProgress() {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
// The login API sets a non-httpOnly `token` cookie (a JWT whose payload carries
// the user's role), so we can read it client-side to decide whether to auto-start.

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(encodedName.length));
}

/** True only when a logged-in customer (role "user") has an active session. */
function isLoggedInCustomer(): boolean {
  const token = getCookieValue("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (payload.role ?? "user") === "user";
  } catch {
    return false;
  }
}

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
  "categories-best-finds": LayoutGrid,
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

/** Renders a description string, turning `**bold**` segments into <strong>. */
function renderDescription(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ fontWeight: 800, color: "#9be9ff" }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

/**
 * Whether the current path is part of the tutorial flow. The tutorial only ever
 * lives on the landing page, /home, and store pages. If the user navigates
 * anywhere else (e.g. /signup or /login) the overlay — and its full-screen click
 * blocker — must NOT render, otherwise the destination page becomes unclickable.
 */
function isTutorialPage(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/home" ||
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname.startsWith("/store?")
  );
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

  // Lock body scroll while active — but only on tutorial pages, so we never
  // leave the page frozen if the user navigates off-flow.
  useEffect(() => {
    if (!isActive || !isTutorialPage(pathname)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isActive, pathname]);

  // Resume an in-progress tutorial after the user navigates away and back
  // (login page, OAuth full-page redirect, etc.). Runs once on mount.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!mounted || resumedRef.current) return;
    resumedRef.current = true;
    const progress = readProgress();
    if (!progress?.active) return;

    let resumeStep = progress.step;
    const savedStep = customerTutorialSteps[progress.step];

    // The user just authenticated and was sent to /home, but the saved step is
    // a pre-login landing-page step (page: "/"). Re-running it would push them
    // back to "/" and make login look broken. Jump forward to the first /home
    // step instead so the tutorial continues naturally after sign-in.
    if (pathname === "/home" && savedStep?.page === "/") {
      const firstHome = customerTutorialSteps.findIndex((s) => s.page === "/home");
      if (firstHome > progress.step) resumeStep = firstHome;
    }

    setStepIndex(resumeStep);
    setIsActive(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Auto-start on the landing page only for a logged-in customer who hasn't seen
  // the tutorial yet. This means a first-time customer gets the tour right after
  // signing in (login redirects them to "/"), while anonymous visitors who are
  // just browsing the public landing page are never interrupted by it.
  useEffect(() => {
    if (!mounted) return;
    try {
      // Don't auto-start if a tutorial is already being resumed.
      if (readProgress()?.active) return;
      if (
        !localStorage.getItem(STORAGE_KEY) &&
        pathname === "/" &&
        isLoggedInCustomer()
      ) {
        const t = setTimeout(() => { setStepIndex(0); setIsActive(true); }, 1400);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [mounted, pathname]);

  // Persist progress whenever the active state or current step changes.
  useEffect(() => {
    if (!mounted) return;
    if (isActive) writeProgress({ active: true, step: stepIndex });
  }, [mounted, isActive, stepIndex]);

  const startTutorial = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    storeIdRef.current = null;
    setStepIndex(0);
    setIsActive(true);
    writeProgress({ active: true, step: 0 });
    router.push("/");
  }, [router]);

  const finishTutorial = useCallback(() => {
    setVisible(false);
    clearProgress();
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
    // If the user has navigated off the tutorial flow (e.g. to /signup or
    // /login), pause: don't force them back and don't draw the overlay. The
    // tutorial stays active so it can resume if they return to a flow page.
    if (!isTutorialPage(pathname)) { setVisible(false); return; }
    // User just authenticated and arrived on /home while the current step is a
    // pre-login landing step (page: "/"). Don't push them back to "/" — advance
    // to the first /home step so the tutorial continues after sign-in.
    if (pathname === "/home" && step.page === "/") {
      const firstHome = customerTutorialSteps.findIndex((s) => s.page === "/home");
      if (firstHome > stepIndex) { setStepIndex(firstHome); return; }
    }
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
      {mounted && isActive && step && isTutorialPage(pathname) &&
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

  const p = isMobile ? { h: 12, v: 14 } : { h: 16, v: 18 };

  const Icon = STEP_ICONS[step.id] ?? Sparkles;

  // Electric-blue palette — matches the landing-page US map glow lines
  const ELECTRIC = "linear-gradient(120deg, #00CFFF 0%, #33D9FF 45%, #66E5FF 100%)";

  return (
    <>
      <style>{TUTORIAL_CSS}</style>

      {/* Backdrop for centered steps */}
      {isCentered && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99990,
            background:
              "radial-gradient(circle at 28% 18%, rgba(0,207,255,0.20), transparent 45%)," +
              "radial-gradient(circle at 78% 82%, rgba(51,217,255,0.16), transparent 45%)," +
              "rgba(5,10,24,0.74)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.32s ease",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Animated glowing spotlight ring for targeted steps */}
      {!isCentered && targetRect && (
        <div
          className="amst-spotlight"
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            zIndex: 99991,
            borderRadius: 12,
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
                transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.9}) translateY(${visible ? 0 : 14}px)`,
                width: `min(${isMobile ? 340 : 420}px, calc(100vw - 24px))`,
              }
            : {
                top: cardPos?.top ?? 0,
                left: cardPos?.left ?? 0,
                width: cardW,
                transform: `scale(${visible ? 1 : 0.92}) translateY(${visible ? 0 : 10}px)`,
              }),
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "all",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing electric border wrapper */}
        <div
          className="amst-card-border"
          style={{ borderRadius: 20, padding: 1.5 }}
        >
          <div
            className="amst-card"
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            {/* Map-style grid + drifting electric glow inside the card */}
            <div className="amst-grid" aria-hidden />
            <div className="amst-card-glow" aria-hidden />

            {/* Floating electric sparks */}
            <span className="amst-spark amst-spark-1" aria-hidden>✦</span>
            <span className="amst-spark amst-spark-2" aria-hidden>✦</span>
            <span className="amst-spark amst-spark-3" aria-hidden>✧</span>

            {/* Electric top accent bar with a running pulse */}
            <div style={{ position: "relative", height: 3, background: ELECTRIC, backgroundSize: "200% 100%" }} className="amst-flow">
              <div className="amst-shimmer" />
            </div>

            {/* Header */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${p.h}px ${p.v}px ${p.h - 2}px`,
                borderBottom: "1px solid rgba(0,207,255,0.18)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  className="amst-icon"
                  style={{
                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38,
                    borderRadius: 11,
                    background: ELECTRIC,
                    backgroundSize: "200% 200%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: "#04121f",
                    boxShadow: "0 0 18px rgba(0,207,255,0.7), 0 0 4px rgba(102,229,255,0.9) inset",
                  }}
                >
                  <Icon size={isMobile ? 16 : 19} strokeWidth={2.2} />
                </div>
                <span
                  className="amst-electric-text"
                  style={{
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#66E5FF",
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
                className="amst-close"
                style={{
                  width: 27, height: 27,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,207,255,0.35)",
                  background: "rgba(0,207,255,0.06)",
                  color: "#7fd8ee",
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
            <div style={{ position: "relative", padding: `${p.v - 2}px ${p.v}px 0` }}>
              {step.title && (
                <h3
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 800,
                    color: "#eaf9ff",
                    lineHeight: 1.35,
                    margin: `0 0 ${isMobile ? 7 : 9}px`,
                    letterSpacing: "-0.01em",
                    fontFamily: "inherit",
                    textShadow: "0 0 12px rgba(0,207,255,0.35)",
                  }}
                >
                  {step.title}
                </h3>
              )}
              <p
                style={{
                  fontSize: isMobile ? 12.5 : 13.5,
                  color: "#c7e9f5",
                  lineHeight: 1.68,
                  margin: 0,
                  fontFamily: "inherit",
                }}
              >
                {renderDescription(step.description)}
              </p>
            </div>

            {/* Progress */}
            <div style={{ position: "relative", padding: `${isMobile ? 12 : 15}px ${p.v}px 0` }}>
              <div
                style={{
                  height: 5,
                  borderRadius: 99,
                  background: "rgba(0,207,255,0.12)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="amst-flow"
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: ELECTRIC,
                    backgroundSize: "200% 100%",
                    borderRadius: 99,
                    boxShadow: "0 0 12px rgba(0,207,255,0.9)",
                    transition: "width 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                position: "relative",
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
                className="amst-skip"
                style={{
                  fontSize: 11, color: "#6b94a6",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 2px", fontFamily: "inherit",
                  visibility: isLast ? "hidden" : "visible",
                }}
              >
                Skip
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="amst-back"
                    style={{
                      height: isMobile ? 31 : 34, paddingLeft: 13, paddingRight: 13,
                      borderRadius: 9,
                      border: "1px solid rgba(0,207,255,0.3)",
                      background: "rgba(0,207,255,0.07)",
                      color: "#9fd9ea",
                      cursor: "pointer", fontSize: 11, fontWeight: 700,
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
                  className="amst-next amst-flow"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: isMobile ? 31 : 34, paddingLeft: isMobile ? 16 : 20, paddingRight: isMobile ? 16 : 20,
                    borderRadius: 9,
                    border: "none",
                    background: ELECTRIC,
                    backgroundSize: "200% 100%",
                    color: "#04121f",
                    fontWeight: 800, fontSize: isMobile ? 11 : 12,
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center",
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 20px rgba(0,207,255,0.65)",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {isLast ? "Start exploring! ⚡" : "Next →"}
                  </span>
                  <span className="amst-next-shine" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Animations / electric styling ───────────────────────────────────────────

const TUTORIAL_CSS = `
@keyframes amstFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes amstBorderSpin {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes amstShimmer {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(420%); }
}
@keyframes amstGlow {
  0%, 100% { transform: translate(-12%, -8%) scale(1); opacity: 0.5; }
  50% { transform: translate(12%, 8%) scale(1.25); opacity: 0.85; }
}
@keyframes amstIconFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(-4deg); }
}
@keyframes amstSpark {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-6px) scale(1.5); opacity: 1; }
}
@keyframes amstGridDrift {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 26px 26px, 26px 26px; }
}
@keyframes amstSpotPulse {
  0%, 100% {
    box-shadow: 0 0 0 9999px rgba(5,10,24,0.74),
      0 0 0 2px rgba(0,207,255,0.95),
      0 0 16px 2px rgba(0,207,255,0.7),
      0 0 38px 8px rgba(51,217,255,0.45);
  }
  50% {
    box-shadow: 0 0 0 9999px rgba(5,10,24,0.74),
      0 0 0 2px rgba(102,229,255,1),
      0 0 28px 6px rgba(0,207,255,0.85),
      0 0 60px 16px rgba(51,217,255,0.5);
  }
}
@keyframes amstNextShine {
  0% { transform: translateX(-150%) skewX(-20deg); }
  60%, 100% { transform: translateX(260%) skewX(-20deg); }
}
@keyframes amstElectricText {
  0%, 100% { text-shadow: 0 0 6px rgba(0,207,255,0.6), 0 0 12px rgba(0,207,255,0.35); }
  50% { text-shadow: 0 0 10px rgba(102,229,255,0.95), 0 0 22px rgba(0,207,255,0.6); }
}

.amst-flow { animation: amstFlow 5s ease infinite; }

.amst-card-border {
  background: linear-gradient(90deg, #00CFFF, #33D9FF, #66E5FF, #0090c4, #33D9FF, #00CFFF);
  background-size: 200% 100%;
  animation: amstBorderSpin 5s linear infinite;
  box-shadow: 0 24px 70px rgba(0,40,70,0.55), 0 0 30px rgba(0,207,255,0.45);
}
.amst-card {
  background:
    radial-gradient(circle at 25% 0%, rgba(0,207,255,0.12), transparent 55%),
    linear-gradient(165deg, #0a1730 0%, #081226 55%, #050d1f 100%);
}
.amst-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,207,255,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,207,255,0.10) 1px, transparent 1px);
  background-size: 26px 26px, 26px 26px;
  mask-image: radial-gradient(circle at 50% 40%, black, transparent 85%);
  -webkit-mask-image: radial-gradient(circle at 50% 40%, black, transparent 85%);
  animation: amstGridDrift 14s linear infinite;
  pointer-events: none;
}
.amst-card-glow {
  position: absolute;
  inset: -40%;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(0,207,255,0.22), transparent 42%),
    radial-gradient(circle at 70% 75%, rgba(51,217,255,0.18), transparent 42%);
  filter: blur(10px);
  animation: amstGlow 7s ease-in-out infinite;
  pointer-events: none;
}
.amst-shimmer {
  position: absolute;
  top: 0; left: 0;
  width: 28%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220,250,255,0.95), transparent);
  animation: amstShimmer 3s ease-in-out infinite;
}
.amst-icon { animation: amstIconFloat 3.6s ease-in-out infinite, amstFlow 5s ease infinite; }
.amst-electric-text { animation: amstElectricText 2.4s ease-in-out infinite; }
.amst-spotlight { animation: amstSpotPulse 2.4s ease-in-out infinite; }
.amst-spark {
  position: absolute;
  z-index: 1;
  font-size: 13px;
  color: #66E5FF;
  pointer-events: none;
  text-shadow: 0 0 10px rgba(0,207,255,0.95);
}
.amst-spark-1 { top: 14px; right: 16%; color: #33D9FF; animation: amstSpark 2.8s ease-in-out infinite; }
.amst-spark-2 { top: 40px; right: 9%; color: #66E5FF; animation: amstSpark 3.5s ease-in-out 0.6s infinite; }
.amst-spark-3 { top: 22px; left: 12%; color: #00CFFF; animation: amstSpark 3.1s ease-in-out 1.1s infinite; }
.amst-next { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.amst-next:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 0 30px rgba(0,207,255,0.9); }
.amst-next:active { transform: translateY(0) scale(0.98); }
.amst-next-shine {
  position: absolute;
  top: 0; left: 0;
  width: 35%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
  animation: amstNextShine 3s ease-in-out infinite;
  z-index: 0;
}
.amst-back { transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
.amst-back:hover { background: rgba(0,207,255,0.16); transform: translateY(-1px); box-shadow: 0 0 14px rgba(0,207,255,0.4); }
.amst-close { transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
.amst-close:hover { color: #66E5FF; background: rgba(0,207,255,0.18); transform: rotate(90deg); box-shadow: 0 0 14px rgba(0,207,255,0.5); }
.amst-skip { transition: color 0.15s ease; }
.amst-skip:hover { color: #66E5FF; }

@media (prefers-reduced-motion: reduce) {
  .amst-flow, .amst-card-border, .amst-card-glow, .amst-grid, .amst-shimmer, .amst-icon,
  .amst-electric-text, .amst-spotlight, .amst-spark, .amst-next-shine { animation: none !important; }
}
`;
