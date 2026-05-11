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
      <div className="relative flex flex-col w-full lg:w-[45%] bg-white px-14 py-12 flex-shrink-0">
        {/* Logo */}
        <div className="mb-auto">
          <LogoFull className="h-[26px] w-auto" />
        </div>

        {/* Form — vertically centred */}
        <div className="flex flex-col justify-center flex-1 py-8">
          <h1 className="text-[26px] font-bold text-[#101828] leading-tight mb-8">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full border border-[#D0D5DD] rounded-lg px-3.5 py-2.5 text-[14px] text-[#101828] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-[#98A2B3]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
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
                  className="w-full border border-[#D0D5DD] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#101828] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-[#98A2B3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[14px] font-semibold text-[#0B3D2E] hover:text-[#166A50]">
                Forgot password
              </button>
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B3D2E] hover:bg-[#0a3328] disabled:opacity-50 text-white font-semibold text-[14px] h-11 rounded-lg transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-[12px] text-[#98A2B3]">
          &copy; {new Date().getFullYear()}, AndikishaHR All rights reserved
        </p>
      </div>

      {/* ── Right panel — full cover image ── */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&q=85&fit=crop&crop=faces,center"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
    </div>
  );
}
