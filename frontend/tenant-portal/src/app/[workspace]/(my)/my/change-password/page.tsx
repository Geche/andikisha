"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock, Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import { findCorrectDashboard } from "@andikisha/ui/auth";

export default function ChangePasswordPage() {
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [done, setDone]                       = useState(false);
  const [roles, setRoles]                     = useState<string[]>([]);

  const strength = (() => {
    if (newPassword.length === 0) return 0;
    let score = 0;
    if (newPassword.length >= 8)          score++;
    if (/[A-Z]/.test(newPassword))        score++;
    if (/[0-9]/.test(newPassword))        score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber", "bg-yellow-400", "bg-brand-700"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { message?: string; roles?: string[]; redirectToLogin?: boolean };

      if (!res.ok) {
        setError(data.message ?? "Could not change your password. Check your current password and try again.");
        return;
      }
      if (data.redirectToLogin) {
        window.location.assign(workspace ? `/${workspace}/login` : "/login");
        return;
      }
      // The BFF set a fresh JWT cookie. Show success; navigation uses a full-
      // document load so the new cookie rides the request (same race as R2-9).
      setRoles(data.roles ?? []);
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const dashboard = `/${workspace}${findCorrectDashboard(new Set(roles))}`;

  return (
    <div className="max-w-[480px] mx-auto py-2">
      <Link
        href={`/${workspace}/my/profile`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to profile
      </Link>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-7 py-7">
        {done ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-4">
              <Check size={24} className="text-brand-700" />
            </div>
            <h1 className="text-[18px] font-bold text-near-black mb-1">Password updated</h1>
            <p className="text-[13.5px] text-neutral-500 mb-6">
              Your password has been changed. Use it the next time you sign in.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign(dashboard)}
              className="w-full bg-brand-900 hover:bg-brand-950 text-white font-semibold text-[14px] py-2.5 rounded-lg transition-colors"
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-11 h-11 bg-brand-50 rounded-xl mb-4">
              <Lock size={20} className="text-brand-700" />
            </div>
            <h1 className="text-[18px] font-bold text-near-black mb-1">Change password</h1>
            <p className="text-[13.5px] text-neutral-500 mb-6">
              Enter your current password, then choose a new one.
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 pr-10 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 pr-10 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strengthColor}`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 w-10 text-right">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
                />
              </div>

              {error && (
                <p role="alert" className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="mt-1 w-full bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-colors"
              >
                {loading ? "Saving…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
