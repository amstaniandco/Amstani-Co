"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorialSteps";

// ─── Context ──────────────────────────────────────────────────────────────────

type TutorialContextType = { isActive: boolean; start: () => void; stop: () => void };
const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  start: () => {},
  stop: () => {},
});

export function useTutorial() {
  return useContext(TutorialContext);
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

type Rect = { top: number; left: number; width: number; height: number };

const CARD_W_INTRO = 400;
const CARD_W_PLACED = 316;
const CARD_H_EST = 200;
const SPOT_PAD = 10;
const TOOLTIP_GAP = 16;

function calcTooltipPos(rect: Rect, position: TutorialStep["position"]): { top: number; left: number } {
  const { top, left, width, height } = rect;
  const sRight  = left + width  + SPOT_PAD;
  const sBottom = top  + height + SPOT_PAD;
  const sCX = left + width  / 2;
  const sCY = top  + height / 2;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Use the actual on-screen card width so the clamp is correct on narrow screens.
  const cardW = Math.min(CARD_W_PLACED, vw - 24);

  let t = 0, l = 0;
  switch (position) {
    case "top":
      t = top - SPOT_PAD - TOOLTIP_GAP - CARD_H_EST;
      l = sCX - cardW / 2;
      break;
    case "right":
      t = sCY - CARD_H_EST / 2;
      l = sRight + TOOLTIP_GAP;
      break;
    case "left":
      t = sCY - CARD_H_EST / 2;
      l = left - SPOT_PAD - TOOLTIP_GAP - cardW;
      break;
    case "bottom":
    default:
      t = sBottom + TOOLTIP_GAP;
      l = sCX - cardW / 2;
  }
  return {
    top:  Math.max(12, Math.min(vh - CARD_H_EST - 12, t)),
    left: Math.max(12, Math.min(vw - cardW - 12, l)),
  };
}

function TutorialOverlay({
  step,
  stepIdx,
  total,
  targetRect,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TutorialStep;
  stepIdx: number;
  total: number;
  targetRect: Rect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  // "intro"  → card is centred, full dark backdrop
  // "placed" → card slides to tooltip position, spotlight takes over
  const [phase, setPhase] = useState<"intro" | "placed">("intro");
  const phaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase("intro");
    if (phaseRef.current) clearTimeout(phaseRef.current);
    if (step.target) {
      phaseRef.current = setTimeout(() => setPhase("placed"), 350);
    }
    return () => { if (phaseRef.current) clearTimeout(phaseRef.current); };
  // stepIdx is the stable key — step object reference changes with each render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const isPlaced = phase === "placed" && !!targetRect && !!step.target;
  const isLast   = stepIdx === total - 1;

  const vw = typeof window !== "undefined" ? window.innerWidth  : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // ── Card geometry ──────────────────────────────────────────────────────────
  // Intro card: cap width to the viewport so it never overflows on small screens,
  // and clamp top/left to keep it fully on-screen.
  let cardW    = Math.min(CARD_W_INTRO, vw - 24);
  let cardTop  = Math.max(12, vh / 2 - CARD_H_EST);
  let cardLeft = Math.max(12, (vw - cardW) / 2);

  if (isPlaced && targetRect) {
    const pos = calcTooltipPos(targetRect, step.position ?? "bottom");
    cardTop  = pos.top;
    cardLeft = pos.left;
    cardW    = Math.min(CARD_W_PLACED, vw - 24);
  }

  // ── Spotlight geometry ─────────────────────────────────────────────────────
  const spotTop    = targetRect ? targetRect.top    - SPOT_PAD : 0;
  const spotLeft   = targetRect ? targetRect.left   - SPOT_PAD : 0;
  const spotWidth  = targetRect ? targetRect.width  + SPOT_PAD * 2 : 0;
  const spotHeight = targetRect ? targetRect.height + SPOT_PAD * 2 : 0;

  const EASE = "cubic-bezier(.4,0,.2,1)";
  const DURATION = "0.22s";
  const TRANSITION = `top ${DURATION} ${EASE}, left ${DURATION} ${EASE}, width ${DURATION} ${EASE}`;

  const btnBase = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition";

  return createPortal(
    <>
      {/* Pointer-events blocker — stops clicks reaching page content during tour */}
      <div className="fixed inset-0 z-[9996]" />

      {/* Full-screen backdrop — fades out as spotlight takes over */}
      <div
        className="fixed inset-0 z-[9997] pointer-events-none"
        style={{
          background: "rgba(0,0,0,0.70)",
          opacity: isPlaced ? 0 : 1,
          transition: `opacity ${DURATION} ${EASE}`,
        }}
      />

      {/* Spotlight — grows in and slides with the target element */}
      {step.target && (
        <div
          className="fixed z-[9998] pointer-events-none rounded-xl"
          style={{
            top:    spotTop,
            left:   spotLeft,
            width:  isPlaced ? spotWidth  : 0,
            height: isPlaced ? spotHeight : 0,
            boxShadow: isPlaced ? "0 0 0 9999px rgba(0,0,0,0.70)" : "none",
            border: isPlaced ? "2px solid rgba(103,232,249,0.55)" : "none",
            transition: `all ${DURATION} ${EASE}`,
          }}
        />
      )}

      {/* Tooltip card — slides from centre to beside the target */}
      <div
        className="fixed z-[9999] pointer-events-auto"
        style={{ top: cardTop, left: cardLeft, width: cardW, transition: TRANSITION }}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)]">
          {/* Progress bar */}
          <div className="h-[3px] bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.round(((stepIdx + 1) / total) * 100)}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header row */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-teal-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-teal-600">
                    Step {stepIdx + 1} of {total}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug text-slate-900">
                  {step.title}
                </h3>
              </div>
              <button
                onClick={onSkip}
                className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[13px] leading-[1.65] text-slate-600">{step.description}</p>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-[11px] text-slate-400 transition hover:text-slate-600"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {stepIdx > 0 && (
                  <button
                    onClick={onPrev}
                    className={`${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                )}
                <button
                  onClick={onNext}
                  className={`${btnBase} bg-teal-600 text-white hover:bg-teal-700`}
                >
                  {isLast ? "Finish" : "Next"}
                  {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [active,     setActive]     = useState(false);
  const [stepIdx,    setStepIdx]    = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [mounted,    setMounted]    = useState(false);
  // Incremented on every start() call so TutorialOverlay remounts with fresh phase state
  const [overlayKey, setOverlayKey] = useState(0);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Auto-start on first visit to any owner page
  useEffect(() => {
    if (!mounted) return;
    if (!localStorage.getItem("owner_tutorial_seen")) {
      setOverlayKey(k => k + 1);
      setStepIdx(0);
      setActive(true);
      // If the user landed on a page other than the first step, navigate there
      if (TUTORIAL_STEPS[0].page !== pathname) {
        router.push(TUTORIAL_STEPS[0].page);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const currentStep = TUTORIAL_STEPS[stepIdx];

  // Find the target element and set spotlight rect
  useEffect(() => {
    if (!active || !currentStep?.target || currentStep.page !== pathname) {
      setTargetRect(null);
      return;
    }

    let cancelled = false;
    let rafId: number;
    let attempts = 0;

    const find = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-tutorial-id="${currentStep.target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 350);
      } else if (attempts++ < 18) {
        rafId = requestAnimationFrame(find);
      }
    };

    const startFind = () => {
      if (cancelled) return;
      // On mobile, sidebar items are hidden until the hamburger is opened.
      // Auto-click the hamburger before spotlighting any sidebar-* target.
      const isSidebarTarget = currentStep.target!.startsWith("sidebar-");
      const isMobile = window.innerWidth < 768;
      if (isSidebarTarget && isMobile) {
        const hamburger = document.querySelector<HTMLElement>('[data-tutorial-id="sidebar-hamburger"]');
        if (hamburger) {
          hamburger.click();
          // Wait for the sidebar slide-in animation (300ms), then find the element
          setTimeout(() => { if (!cancelled) find(); }, 320);
          return;
        }
      }
      find();
    };

    const timer = setTimeout(startFind, 200);
    return () => { cancelled = true; clearTimeout(timer); cancelAnimationFrame(rafId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx, pathname]);

  // Keep rect in sync while the user scrolls or resizes
  useEffect(() => {
    if (!active || !currentStep?.target) return;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tutorial-id="${currentStep.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [active, stepIdx, currentStep]);

  const stop = useCallback(() => {
    // Close the mobile sidebar if the tour is stopped while highlighting a sidebar item
    const curTarget = TUTORIAL_STEPS[stepIdx]?.target;
    if (curTarget?.startsWith("sidebar-") && window.innerWidth < 768) {
      const closeBtn = document.querySelector<HTMLElement>('[data-tutorial-id="sidebar-close"]');
      if (closeBtn) closeBtn.click();
    }
    setActive(false);
    setTargetRect(null);
    localStorage.setItem("owner_tutorial_seen", "true");
  }, [stepIdx]);

  const start = useCallback(() => {
    localStorage.removeItem("owner_tutorial_seen");
    setOverlayKey(k => k + 1); // forces TutorialOverlay to remount with clean phase state
    setStepIdx(0);
    setTargetRect(null);
    setActive(true);
    if (TUTORIAL_STEPS[0].page !== pathname) router.push(TUTORIAL_STEPS[0].page);
  }, [pathname, router]);

  const navigate = useCallback(
    (idx: number) => {
      const step = TUTORIAL_STEPS[idx];
      if (!step) return;

      // Close the mobile sidebar when leaving a sidebar step
      // (the next step may be on a different page or a non-sidebar element)
      const prevTarget = TUTORIAL_STEPS[stepIdx]?.target;
      if (prevTarget?.startsWith("sidebar-") && window.innerWidth < 768) {
        const closeBtn = document.querySelector<HTMLElement>('[data-tutorial-id="sidebar-close"]');
        if (closeBtn) closeBtn.click();
      }

      setStepIdx(idx);
      setTargetRect(null);
      if (step.page !== pathname) router.push(step.page);
    },
    [pathname, router, stepIdx],
  );

  const next = useCallback(() => {
    const current = TUTORIAL_STEPS[stepIdx];
    const nextIdx = stepIdx + 1;

    // If this step has a postAction, click its target element before advancing.
    // This is used to auto-open modals (e.g. the first claim row).
    if (current?.postAction) {
      const el = document.querySelector<HTMLElement>(`[data-tutorial-id="${current.postAction}"]`);
      if (el) {
        el.click();
        setTimeout(() => {
          if (nextIdx >= TUTORIAL_STEPS.length) { stop(); return; }
          navigate(nextIdx);
        }, 600);
        return;
      }
    }

    if (nextIdx >= TUTORIAL_STEPS.length) { stop(); return; }
    navigate(nextIdx);
  }, [stepIdx, navigate, stop]);

  const prev = useCallback(() => {
    if (stepIdx > 0) navigate(stepIdx - 1);
  }, [stepIdx, navigate]);

  const showOverlay = active && mounted && currentStep?.page === pathname;

  return (
    <TutorialContext.Provider value={{ isActive: active, start, stop }}>
      {children}
      {showOverlay && (
        <TutorialOverlay
          key={overlayKey}
          step={currentStep}
          stepIdx={stepIdx}
          total={TUTORIAL_STEPS.length}
          targetRect={targetRect}
          onNext={next}
          onPrev={prev}
          onSkip={stop}
        />
      )}
    </TutorialContext.Provider>
  );
}
