"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoFull } from "@andikisha/ui";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-8">
        <div className="mb-8">
          <LogoFull className="h-7 w-auto" />
          <p className="mt-4 text-[13.5px] text-gray-500">
            Platform administration — superadmin access only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent"
              placeholder="superadmin@andikisha.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-60 text-[#02110C] font-bold rounded-lg py-2.5 text-[13.5px] transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
