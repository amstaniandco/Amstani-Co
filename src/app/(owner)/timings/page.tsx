"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Clock3, Store, TriangleAlert, Loader2, CheckCircle2 } from "lucide-react";
import GoLiveModal from "@/src/components/owner/GoLiveModal";

type SessionRecord = {
  _id: string;
  date: string;
  from: string;
  to: string;
  durationMinutes: number;
  warning: boolean;
  completed: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 30;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function OwnerTimingsPage() {
  const [storeName, setStoreName] = useState("My Store");
  const [storeStatus, setStoreStatus] = useState("pending");
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("15:00");
  const [isLive, setIsLive] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [warningsResetAt, setWarningsResetAt] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [goingLive, setGoingLive] = useState(false);
  const [goingOffline, setGoingOffline] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const loadSessions = useCallback(async (month: number, year: number) => {
    try {
      const res = await fetch(`/api/owner/live-sessions?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/owner/timings");
        if (res.ok) {
          const data = await res.json();
          setStoreName(data.storeName || "My Store");
          setStoreStatus(data.storeStatus || "pending");
          setFrom(data.dailyTimings?.from || "09:00");
          setTo(data.dailyTimings?.to || "15:00");
          setIsLive(data.isLive || false);
          setWarnings(data.warnings || 0);
          setWarningsResetAt(data.warningsResetAt || null);
        }
        await loadSessions(selectedMonth, selectedYear);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    loadSessions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, loadSessions]);

  const handleSaveTimings = async () => {
    setSaveMsg(null);
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    let duration = (th * 60 + tm) - (fh * 60 + fm);
    if (duration < 0) duration += 1440;
    if (duration < 360) {
      setSaveMsg({ type: "error", text: "Schedule must be at least 6 hours." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/owner/timings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      if (res.ok) {
        setSaveMsg({ type: "success", text: "Timings saved!" });
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        const d = await res.json();
        setSaveMsg({ type: "error", text: d.error || "Failed to save." });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handleGoLive = async (liveLink: string) => {
    setGoingLive(true);
    try {
      const res = await fetch("/api/owner/store/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveLink }),
      });
      if (res.ok) {
        setIsLive(true);
        setShowModal(false);
      }
    } finally {
      setGoingLive(false);
    }
  };

  const handleGoOffline = async () => {
    setGoingOffline(true);
    try {
      const res = await fetch("/api/owner/store/go-offline", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsLive(false);
        setWarnings(data.warnings ?? warnings);
        await loadSessions(selectedMonth, selectedYear);
      }
    } finally {
      setGoingOffline(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-40 rounded-[18px] bg-slate-200 dark:bg-slate-700" />
          <div className="h-40 rounded-[18px] bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-80 rounded-[32px] bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <>
      <GoLiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onGoLive={handleGoLive}
        loading={goingLive}
      />

      {/* Top bar */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
        </div>

        {isLive ? (
          <button
            type="button"
            onClick={handleGoOffline}
            disabled={goingOffline}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:self-auto sm:px-6 disabled:opacity-60"
          >
            {goingOffline ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            End Live
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={storeStatus !== "active"}
            title={storeStatus !== "active" ? "Store must be approved before going live" : ""}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go Live
          </button>
        )}
      </section>

      {/* Timing + Warning cards */}
      <section className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">

        {/* Timing card */}
        <div className="rounded-[18px] bg-white dark:bg-slate-800 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <h3 className="text-[1.45rem] font-bold text-slate-900 dark:text-slate-100">Set Store Timings</h3>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Minimum 6 hours of live is mandatory</p>

          {saveMsg && (
            <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              saveMsg.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}>
              {saveMsg.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {saveMsg.text}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 sm:gap-x-8">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">From</p>
              <div className="flex h-9 w-full max-w-[140px] items-center gap-2 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-slate-700 dark:text-slate-100">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-400 text-[10px]">
                  <Clock3 className="h-2.5 w-2.5" />
                </span>
                <input
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="sm:justify-self-end space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">To</p>
              <div className="flex h-9 w-full max-w-[140px] items-center gap-2 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-slate-700 dark:text-slate-100">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-400 text-[10px]">
                  <Clock3 className="h-2.5 w-2.5" />
                </span>
                <input
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveTimings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#65bbc5] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#53aab5] disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-700"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Timings
            </button>
          </div>
        </div>

        {/* Warning card */}
        <div className="rounded-[18px] bg-white dark:bg-slate-800 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <TriangleAlert className={`h-5 w-5 ${warnings >= 3 ? "text-red-500" : warnings >= 1 ? "text-amber-500" : "text-slate-400"}`} />
            <h3 className="text-[1.45rem] font-bold">Warnings</h3>
          </div>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            {warnings >= 3
              ? "Maximum warnings reached — admin has been notified."
              : "Failing to go live 6 hours daily may lead to account suspension."}
          </p>

          <p className={`mt-5 text-center text-[2.15rem] font-bold leading-none ${
            warnings >= 3 ? "text-red-500" : warnings >= 1 ? "text-amber-500" : "text-slate-900 dark:text-slate-100"
          }`}>
            {warnings}/3
          </p>

          {warnings > 0 && (
            <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
              Reset in: {daysUntil(warningsResetAt)} Day{daysUntil(warningsResetAt) !== 1 ? "s" : ""}
            </p>
          )}

          {warnings >= 1 && warnings < 3 && (
            <div className="mt-4 space-y-1.5">
              {Array.from({ length: warnings }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  Warning {i + 1}: Live session ended before 6 hours
                </div>
              ))}
            </div>
          )}

          {warnings >= 3 && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-xs text-red-700 dark:text-red-300">
              Your account is at risk of suspension. Please maintain 6 hours of daily live time.
            </div>
          )}
        </div>
      </section>

      {/* Monthly time record */}
      <section className="mt-4">
        <div className="overflow-hidden rounded-[32px] bg-white dark:bg-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between px-5 py-6 sm:px-7 sm:py-7">
            <h3 className="text-[1.45rem] font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
              Monthly Time Record
            </h3>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMonthPicker((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
              >
                {MONTHS[selectedMonth - 1]} {selectedYear}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showMonthPicker && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
                  {MONTHS.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(idx + 1);
                        setShowMonthPicker(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        selectedMonth === idx + 1 ? "font-semibold text-[#65bbc5]" : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {m} {selectedYear}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr] border-b border-slate-100 dark:border-slate-700 px-7 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                <div>Date</div>
                <div>From</div>
                <div>To</div>
                <div>Time Completed</div>
              </div>

              {sessions.length === 0 ? (
                <div className="px-7 py-8 text-sm text-slate-400 dark:text-slate-500">
                  No live sessions recorded for {MONTHS[selectedMonth - 1]} {selectedYear}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      className={`grid grid-cols-[1fr_0.8fr_0.8fr_1fr] items-center px-7 py-5 text-[15px] ${
                        s.warning ? "bg-red-50 dark:bg-red-900/10" : ""
                      }`}
                    >
                      <div className="font-semibold text-slate-700 dark:text-slate-200">{s.date}</div>
                      <div className="text-slate-700 dark:text-slate-300">{s.from}</div>
                      <div className="text-slate-700 dark:text-slate-300">{s.to}</div>
                      <div className={`font-semibold ${s.warning ? "text-red-500" : "text-slate-700 dark:text-slate-200"}`}>
                        {s.completed}
                        {s.warning && " ⚠"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
