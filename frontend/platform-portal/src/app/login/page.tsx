"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ExternalLink, Mail } from "lucide-react";
import { LogoFull } from "@andikisha/ui";

type LoginError =
  | { kind: "general"; message: string }
  | { kind: "wrong_portal"; tenantPortalUrl?: string };

function safeReturnTo(raw: string | null): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  // Must be a same-origin path starting with / but not /login itself.
  return decoded.startsWith("/") && !decoded.startsWith("/login") ? decoded : null;
}

export default function PlatformLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const raw = await res.json() as Record<string, unknown>;
      const errorCode = typeof raw.error === "string" ? raw.error : undefined;
      const errorMsg = typeof raw.message === "string" ? raw.message : undefined;
      const tenantPortalUrl = typeof raw.tenantPortalUrl === "string" ? raw.tenantPortalUrl : undefined;

      if (!res.ok) {
        if (errorCode === "WRONG_PORTAL") {
          setError({ kind: "wrong_portal", tenantPortalUrl });
          return;
        }
        setError({ kind: "general", message: errorMsg ?? "Invalid credentials. Please try again." });
        return;
      }

      router.replace(returnTo ?? "/dashboard");
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
        background:
          "linear-gradient(135deg, var(--color-brand-950) 0%, var(--color-brand-900) 50%, var(--color-brand-700) 100%)",
      }}
    >
      {/* Logo — top centre */}
      <div className="w-full flex justify-center pt-2">
        <LogoFull className="h-[28px] w-auto brightness-0 invert" />
      </div>

      {/* Form card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-bold text-near-black mb-1">Platform Sign In</h1>
          <p className="text-[14px] text-neutral-500">Platform Administration — Staff Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@andikishahr.com"
                required
                autoComplete="email"
                className="w-full border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail size={16} />
              </span>
            </div>
          </div>

          {/* Password */}
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

          {/* Error states */}
          {error?.kind === "general" && (
            <p role="alert" className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error.message}
            </p>
          )}

          {error?.kind === "wrong_portal" && (
            <div role="alert" className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <p className="font-medium mb-1">Wrong portal</p>
              <p className="mb-2">This account uses the AndikishaHR tenant portal, not the platform portal.</p>
              {error.tenantPortalUrl ? (
                <a
                  href={error.tenantPortalUrl}
                  className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                >
                  Open tenant portal
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-amber-600">Contact your administrator for the tenant portal URL.</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 hover:bg-brand-800 active:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] h-11 rounded-lg transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-[12px] text-white/50 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>
    </div>
  );
}
