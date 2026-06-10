"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { findCorrectDashboard } from "@andikisha/ui/auth";

export default function SetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);

  const strength = (() => {
    if (newPassword.length === 0) return 0;
    let score = 0;
    if (newPassword.length >= 8)           score++;
    if (/[A-Z]/.test(newPassword))         score++;
    if (/[0-9]/.test(newPassword))         score++;
    if (/[^A-Za-z0-9]/.test(newPassword))  score++;
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

      const data = await res.json() as {
        ok?: boolean;
        message?: string;
        roles?: string[];
        redirectToLogin?: boolean;
      };

      if (!res.ok) {
        setError(data.message ?? "Failed to change password. Check your current password and try again.");
        return;
      }

      if (data.redirectToLogin) {
        // Re-authentication failed after change — send to login (edge case)
        router.replace(workspace ? `/${workspace}/login` : "/login");
        return;
      }

      // Fresh JWT is set in the cookie by the BFF. Full-document navigation (not
      // router.replace): a soft client navigation races the just-set cookie commit,
      // so middleware can miss it and bounce to /login (same root cause as R2-9).
      const roles = new Set<string>(data.roles ?? []);
      window.location.assign(`/${workspace}${findCorrectDashboard(roles)}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, var(--color-brand-950) 0%, var(--color-brand-900) 50%, var(--color-brand-700) 100%)",
      }}
    >
      <div className="w-full flex justify-center pt-2">
        <LogoFull className="h-[28px] w-auto brightness-0 invert" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xl w-full max-w-[420px] px-8 py-10">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-5">
          <Lock size={22} className="text-brand-700" />
        </div>

        <h1 className="text-[22px] font-bold text-near-black mb-1">Set Your Password</h1>
        <p className="text-[13.5px] text-neutral-500 mb-7">
          Your account requires a password change before you can continue.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Current (temporary) password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
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
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="mt-1 w-full bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] py-3 rounded-xl transition-colors"
          >
            {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      </div>

      <p className="text-[12px] text-white/50 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>
    </div>
  );
}
