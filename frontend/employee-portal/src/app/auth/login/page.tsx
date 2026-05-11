"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { LogoFull } from "@andikisha/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Invalid credentials");
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — form ── */}
      <div className="relative flex flex-col w-full lg:w-1/2 bg-white px-10 py-10">
        {/* Logo */}
        <div className="mb-auto">
          <LogoFull className="h-[26px] w-auto" />
        </div>

        {/* Form — vertically centred */}
        <div className="flex flex-col justify-center flex-1 py-8 max-w-[360px] w-full mx-auto">
          <h1 className="text-[24px] font-bold text-[#101828] leading-tight mb-1.5">
            Sign in
          </h1>
          <p className="text-[13.5px] text-gray-500 mb-8">
            Enter your work email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-400 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
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
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-400 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B3D2E] hover:bg-[#0a3328] disabled:opacity-50 text-white font-semibold text-[14px] h-11 rounded-lg transition-colors mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-[12px] text-gray-400 mt-auto">
          &copy; {new Date().getFullYear()} Andikisha. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B3D2E] flex-col items-center justify-center px-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative text-center max-w-sm">
          <LogoFull variant="white" className="h-9 w-auto mx-auto mb-10" />
          <p className="text-[22px] font-bold text-white leading-snug mb-4">
            Your HR, payroll, and compliance — all in one place.
          </p>
          <p className="text-[14px] text-white/60 leading-relaxed">
            Built for Kenyan and East African businesses. Compliant with PAYE, SHIF, NSSF, and Housing Levy regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
