"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff, ExternalLink, Mail } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { findCorrectDashboard } from "@andikisha/ui/auth";

type LoginError =
  | { kind: "general"; message: string }
  | { kind: "wrong_portal"; platformPortalUrl?: string };

export default function WorkspaceLoginPage() {
  const router = useRouter();
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<LoginError | null>(null);
  const [loading, setLoading]           = useState(false);
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace, email, password }),
      });
      const raw = await res.json() as Record<string, unknown>;
      const errorCode = typeof raw.error === "string" ? raw.error : undefined;
      const errorMsg  = typeof raw.message === "string" ? raw.message : undefined;
      const platformPortalUrl = typeof raw.platformPortalUrl === "string" ? raw.platformPortalUrl : undefined;
      const rawUser = raw.user !== null && typeof raw.user === "object" ? raw.user as Record<string, unknown> : undefined;
      const data = {
        error: errorCode,
        message: errorMsg,
        platformPortalUrl,
        user: rawUser
          ? {
              role:  typeof rawUser.role === "string" ? rawUser.role : undefined,
              roles: Array.isArray(rawUser.roles) ? (rawUser.roles as string[]) : undefined,
            }
          : undefined,
      };

      if (!res.ok) {
        if (data.error === "WRONG_PORTAL") {
          setError({ kind: "wrong_portal", platformPortalUrl: data.platformPortalUrl });
          return;
        }
        setError({ kind: "general", message: data.message ?? "Invalid credentials. Please try again." });
        return;
      }

      const roles = new Set<string>(data.user?.roles ?? (data.user?.role ? [data.user.role] : []));
      const dashboard = `/${workspace}${findCorrectDashboard(roles)}`;
      router.replace(dashboard);
    } catch {
      setError({ kind: "general", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #071E13 0%, #0B3D2E 50%, #166A50 100%)",
      }}
    >
      <div className="w-full flex justify-center pt-2">
        <LogoFull className="h-[28px] w-auto brightness-0 invert" />
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl px-8 py-10">
        <div className="text-center mb-8">
          <p className="text-[12px] font-mono text-neutral-400 mb-1">{workspace}</p>
          <h1 className="text-[22px] font-bold text-near-black mb-1">Sign In</h1>
          <p className="text-[14px] text-neutral-500">Please enter your details to sign in</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail size={16} />
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-[13px] font-medium text-error hover:text-red-600 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {error?.kind === "general" && (
            <p role="alert" className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error.message}
            </p>
          )}

          {error?.kind === "wrong_portal" && (
            <div role="alert" className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <p className="font-medium mb-1">Wrong portal</p>
              <p className="mb-2">This account uses the Andikisha platform portal.</p>
              {error.platformPortalUrl ? (
                <a href={error.platformPortalUrl} className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2">
                  Open platform portal <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-amber-600">Contact your administrator for the platform portal URL.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 hover:bg-brand-800 active:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] h-11 rounded-lg transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-[12.5px] text-neutral-400">
            Wrong workspace?{" "}
            <Link href="/login" className="text-brand-800 font-medium hover:underline">
              Go back
            </Link>
          </p>
        </form>
      </div>

      <p className="text-[12px] text-white/50 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-[380px] p-6">
            <h2 className="text-[16px] font-bold text-near-black mb-1">Forgot Password?</h2>
            {forgotSent ? (
              <>
                <p className="text-[13.5px] text-neutral-600 mt-2">
                  If that email address is registered, you will receive a password reset link shortly.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                  className="mt-5 w-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotLoading(true);
                  try {
                    await fetch("/api/auth/forgot-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: forgotEmail, workspace }),
                    });
                    setForgotSent(true);
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="flex flex-col gap-4 mt-4"
              >
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={forgotLoading}
                    placeholder="you@company.co.ke"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-300 disabled:bg-neutral-50"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForgot(false)} disabled={forgotLoading}
                    className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-xl transition-colors disabled:opacity-60">
                    Cancel
                  </button>
                  <button type="submit" disabled={forgotLoading || !forgotEmail}
                    className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-xl transition-colors">
                    {forgotLoading ? "Sending…" : "Send Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
