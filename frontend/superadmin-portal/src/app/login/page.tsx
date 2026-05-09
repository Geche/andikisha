"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password, remember });
      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error("[login error]", err);
      const msg = err instanceof ApiError ? err.message : "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4">
      {/* Logo + heading above card */}
      <div className="flex flex-col items-center mb-8">
        <LogoFull className="h-8 w-auto mb-6" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-[400px] p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent transition-shadow"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            {/*<label className="flex items-center gap-2 cursor-pointer">*/}
            {/*  <input*/}
            {/*    type="checkbox"*/}
            {/*    checked={remember}*/}
            {/*    onChange={(e) => setRemember(e.target.checked)}*/}
            {/*    className="w-4 h-4 rounded border-gray-300 accent-[#0B3D2E] cursor-pointer"*/}
            {/*  />*/}
            {/*  <span className="text-[14px] text-gray-700">Remember for 30 days</span>*/}
            {/*</label>*/}
            {/*<button*/}
            {/*  type="button"*/}
            {/*  className="text-[14px] font-semibold text-[#166A50] hover:text-[#0B3D2E] transition-colors"*/}
            {/*>*/}
            {/*  Forgot password*/}
            {/*</button>*/}
          </div>

          {/* Error */}
          {error && (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-60 text-[#02110C] font-bold rounded-lg py-2.5 text-[15px] transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
