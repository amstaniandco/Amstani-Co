"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react";
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorialSteps";

// ─── Types ────────────────────────────────────────────────────────────────────

type Rect = { top: number; left: number; width: number; height: number };

type TutorialContextType = {
  isActive: boolean;
  start: () => void;
  stop: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  start: () => {},
  stop: () => {},
});

export function useTutorial() {
  return useContext(TutorialContext);
}

// ─── Spotlight Overlay ────────────────────────────────────────────────────────

const TOOLTIP_W = 284;
const TOOLTIP_H = 190;
const SPOT_PAD = 8;

function calcTooltipStyle(
  rect: Rect,
  position: TutorialStep["position"],
): React.CSSProperties {
  const { top, left, width, height } = rect;
  const sTop = top - SPOT_PAD;
  const sLeft = left - SPOT_PAD;
  const sRight = sLeft + width + SPOT_PAD * 2;
  const sBottom = sTop + height + SPOT_PAD * 2;
  const sCX = sLeft + (sRight - sLeft) / 2;
  const sCY = sTop + (sBottom - sTop) / 2;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampL = (v: number) => Math.max(8, Math.min(vw - TOOLTIP_W - 8, v));
  const clampT = (v: number) => Math.max(8, Math.min(vh - TOOLTIP_H - 8, v));

  switch (position) {
    case "right":
      return { left: Math.min(sRight + 12, vw - TOOLTIP_W - 8), top: clampT(sCY - TOOLTIP_H / 2) };
    case "left":
      return { left: Math.max(8, sLeft - TOOLTIP_W - 12), top: clampT(sCY - TOOLTIP_H / 2) };
    case "top":
      return { left: clampL(sCX - TOOLTIP_W / 2), top: clampT(sTop - TOOLTIP_H - 12) };
    case "bottom":
    default:
      return { left: clampL(sCX - TOOLTIP_W / 2), top: clampT(sBottom + 12) };
  }
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
  const isLast = stepIdx === total - 1;
  const isCentered = !step.target || !targetRect;

  const btnBase =
    "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition";

  if (isCentered) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4">
        <div
          className="w-full rounded-2xl bg-white p-6 shadow-2xl"
          style={{ maxWidth: 360 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-600">
              <BookOpen className="h-3.5 w-3.5" />
              Store Tour · {stepIdx + 1} / {total}
            </div>
            <button onClick={onSkip} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
          <div className="mt-5 flex items-center justify-between">
            <button onClick={onSkip} className="text-xs text-slate-400 hover:text-slate-600">
              Skip tour
            </button>
            <div className="flex gap-2">
              {stepIdx > 0 && (
                <button onClick={onPrev} className={`${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <button onClick={onNext} className={`${btnBase} bg-teal-600 text-white hover:bg-teal-700`}>
                {isLast ? "Finish" : "Next"} {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Spotlight mode
  const { top, left, width, height } = targetRect!;
  const spotStyle: React.CSSProperties = {
    position: "fixed",
    top: top - SPOT_PAD,
    left: left - SPOT_PAD,
    width: width + SPOT_PAD * 2,
    height: height + SPOT_PAD * 2,
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
    borderRadius: 12,
    border: "2px solid rgba(103, 232, 249, 0.75)",
    zIndex: 9999,
    pointerEvents: "none",
  };

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    width: TOOLTIP_W,
    zIndex: 10000,
    ...calcTooltipStyle(targetRect!, step.position),
  };

  return (
    <>
      {/* Click blocker — prevents interacting with page content during tour */}
      <div className="fixed inset-0 z-[9997]" />
      {/* Spotlight cutout */}
      <div style={spotStyle} />
      {/* Tooltip */}
      <div style={tooltipStyle} className="rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-600">
            <BookOpen className="h-3 w-3" />
            {stepIdx + 1} / {total}
          </div>
          <button onClick={onSkip} className="text-slate-400 hover:text-slate-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[13px] font-bold text-slate-900">{step.title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{step.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={onSkip} className="text-[11px] text-slate-400 hover:text-slate-600">
            Skip
          </button>
          <div className="flex gap-1.5">
            {stepIdx > 0 && (
              <button onClick={onPrev} className={`${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button onClick={onNext} className={`${btnBase} bg-teal-600 text-white hover:bg-teal-700`}>
              {isLast ? "Done" : "Next"} {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Auto-start on first visit to any owner page
  useEffect(() => {
    if (!mounted) return;
    if (!localStorage.getItem("owner_tutorial_seen")) {
      setActive(true);
      setStepIdx(0);
    }
  }, [mounted]);

  const currentStep = TUTORIAL_STEPS[stepIdx];

  // Find target element and set spotlight rect
  useEffect(() => {
    if (!active || !currentStep?.target || currentStep.page !== pathname) {
      setTargetRect(null);
      return;
    }

    let rafId: number;
    let attempts = 0;

    const find = () => {
      const el = document.querySelector(
        `[data-tutorial-id="${currentStep.target}"]`,
      ) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Wait for scroll to settle then capture rect
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 350);
      } else if (attempts++ < 15) {
        // Element not yet painted — retry
        rafId = requestAnimationFrame(find);
      }
    };

    const timer = setTimeout(find, 200);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx, pathname]);

  // Keep rect in sync while user scrolls / window resizes
  useEffect(() => {
    if (!active || !currentStep?.target) return;

    const update = () => {
      const el = document.querySelector(
        `[data-tutorial-id="${currentStep.target}"]`,
      ) as HTMLElement | null;
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
    setActive(false);
    setTargetRect(null);
    localStorage.setItem("owner_tutorial_seen", "true");
  }, []);

  const start = useCallback(() => {
    localStorage.removeItem("owner_tutorial_seen");
    setStepIdx(0);
    setTargetRect(null);
    setActive(true);
    if (TUTORIAL_STEPS[0].page !== pathname) {
      router.push(TUTORIAL_STEPS[0].page);
    }
  }, [pathname, router]);

  const navigate = useCallback(
    (idx: number) => {
      const step = TUTORIAL_STEPS[idx];
      if (!step) return;
      setStepIdx(idx);
      setTargetRect(null);
      if (step.page !== pathname) {
        router.push(step.page);
      }
    },
    [pathname, router],
  );

  const next = useCallback(() => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= TUTORIAL_STEPS.length) { stop(); return; }
    navigate(nextIdx);
  }, [stepIdx, navigate, stop]);

  const prev = useCallback(() => {
    if (stepIdx <= 0) return;
    navigate(stepIdx - 1);
  }, [stepIdx, navigate]);

  const isCurrentPage = currentStep?.page === pathname;
  const showOverlay = active && mounted && isCurrentPage;

  return (
    <TutorialContext.Provider value={{ isActive: active, start, stop }}>
      {children}
      {showOverlay &&
        createPortal(
          <TutorialOverlay
            step={currentStep}
            stepIdx={stepIdx}
            total={TUTORIAL_STEPS.length}
            targetRect={targetRect}
            onNext={next}
            onPrev={prev}
            onSkip={stop}
          />,
          document.body,
        )}
    </TutorialContext.Provider>
  );
}
