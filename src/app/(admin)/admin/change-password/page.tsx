"use client";

import { FormEvent, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Unable to change password." });
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", message: data.message ?? "Password changed successfully." });
    } catch {
      setStatus({ type: "error", message: "Unable to change password. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/change-password" className="admin-sidebar-flush" />

        <main className="admin-main-scroll flex flex-col gap-4">
          <AdminNavbar />

          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
              <KeyRound className="h-4 w-4" />
              Account security
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">Change password</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Keep your administrator account protected with a strong, unique password.
            </p>
          </div>

          <section className="max-w-4xl overflow-hidden rounded-[28px] border border-[#dbe5eb] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative overflow-hidden bg-[#101a2f] p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/15 text-cyan-200">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold leading-tight sm:text-2xl">Secure your control room</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Your password protects access to users, stores, finances, and other administrative tools.
                  </p>
                  <div className="mt-8 space-y-4 text-sm text-slate-300">
                    <p className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      Use a password you do not use anywhere else.
                    </p>
                    <p className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      Avoid names, dates, and easily guessed details.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Set a new password</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter it twice to confirm the change.</p>
                </div>

                <div className="space-y-5">
                  <PasswordField
                    id="new-password"
                    label="New password"
                    value={password}
                    visible={showPassword}
                    onChange={setPassword}
                    onToggle={() => setShowPassword((visible) => !visible)}
                  />

                  <PasswordField
                    id="confirm-password"
                    label="Confirm new password"
                    value={confirmPassword}
                    visible={showConfirmation}
                    onChange={setConfirmPassword}
                    onToggle={() => setShowConfirmation((visible) => !visible)}
                  />

                  <div className="rounded-2xl border border-[#e3ebef] bg-[#f8fbfc] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Password checklist
                    </p>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <Requirement met={password.length >= 8} text="At least 8 characters" />
                      <Requirement met={password.length > 0 && password === confirmPassword} text="Passwords match" />
                    </div>
                  </div>

                  {status && (
                    <p
                      role="status"
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        status.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {status.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#101a2f] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,26,47,0.18)] transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Changing password..." : "Update password"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  visible,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-[#dbe5ea] bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <p className={`flex items-center gap-2 ${met ? "text-emerald-700" : "text-slate-500"}`}>
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${met ? "bg-emerald-100" : "bg-slate-200"}`}>
        <Check className={`h-3 w-3 ${met ? "text-emerald-600" : "text-slate-400"}`} />
      </span>
      {text}
    </p>
  );
}
