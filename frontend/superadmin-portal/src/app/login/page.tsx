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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password, remember: false });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Invalid credentials. Please try again.";
      setError(msg);
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
              <label htmlFor="email" className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Email
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085]"
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

      {/* ── Right panel — testimonial + app mockup ── */}
      <div className="hidden lg:flex flex-1 flex-col bg-[#F9FAFB] px-14 py-14 overflow-hidden">
        {/* Testimonial */}
        <div className="max-w-xl">
          <p className="text-[30px] font-bold text-[#101828] leading-snug">
            Managing payroll compliance for our entire portfolio used to be a nightmare.
            AndikishaHR makes it effortless.
          </p>
          <div className="flex items-start justify-between mt-6">
            <div>
              <p className="text-[14px] font-semibold text-[#101828]">— Daniel Kariuki</p>
              <p className="text-[13px] text-[#667085]">CTO, Nairobi Capital Group</p>
            </div>
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="#101828">
                  <path d="M9 1.5L11.163 6.245L16.5 7.059L12.75 10.755L13.677 16L9 13.5L4.323 16L5.25 10.755L1.5 7.059L6.837 6.245L9 1.5Z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* App preview mockup */}
        <div className="mt-10 flex-1 relative">
          <div className="absolute inset-0 flex items-start">
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200" style={{ maxHeight: "440px" }}>
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white border-b border-gray-200">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FDA29B]"/>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEF0C7]"/>
                <div className="w-2.5 h-2.5 rounded-full bg-[#D1FAE5]"/>
                <div className="flex-1 mx-4 h-5 bg-[#F2F4F7] rounded-full text-[10px] text-[#98A2B3] flex items-center px-3">
                  admin.andikishahr.co.ke
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="flex bg-white" style={{ height: "380px" }}>
                {/* Sidebar */}
                <div className="w-44 flex-shrink-0 border-r border-gray-100 bg-white px-3 py-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 px-2 mb-4">
                    <div className="w-5 h-5 rounded bg-[#0B3D2E]"/>
                    <div className="h-2.5 w-16 bg-[#0B3D2E] rounded-full opacity-80"/>
                  </div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">Customers</p>
                  {[["Tenants", true], ["Plans", false], ["Features", false]].map(([item, active]) => (
                    <div key={String(item)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${active ? "bg-gray-100" : ""}`}>
                      <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${active ? "bg-[#0B3D2E]" : "bg-gray-200"}`}/>
                      <div className={`h-2 rounded-full ${active ? "w-10 bg-[#0B3D2E]" : "w-12 bg-gray-200"}`}/>
                    </div>
                  ))}
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2 mt-3 mb-1">Platform</p>
                  {["Audit Log", "Config"].map((item) => (
                    <div key={item} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md">
                      <div className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0"/>
                      <div className="h-2 w-12 bg-gray-200 rounded-full"/>
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 bg-white p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-3.5 w-20 bg-gray-800 rounded-full mb-1"/>
                      <div className="h-2 w-32 bg-gray-300 rounded-full"/>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-100 rounded-md border border-gray-200"/>
                      <div className="h-6 w-22 bg-[#E8A020] rounded-md"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 mb-4">
                    {["#D1FAE5","#FEF3C7","#DBEAFE","#F3E8FF"].map((bg, i) => (
                      <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <div className="h-2 w-12 bg-gray-200 rounded-full mb-2"/>
                        <div className="h-3.5 w-10 bg-gray-700 rounded-full"/>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center">
                      <div className="h-2.5 w-14 bg-gray-700 rounded-full"/>
                      <div className="h-5 w-16 bg-[#E8A020] rounded-md"/>
                    </div>
                    {[1,2,3].map(i => (
                      <div key={i} className="px-4 py-2.5 border-b border-gray-50 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0"/>
                        <div className="h-2 w-20 bg-gray-200 rounded-full"/>
                        <div className="h-2 w-14 bg-gray-100 rounded-full ml-auto"/>
                        <div className="h-4 w-10 bg-[#D1FAE5] rounded-full"/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
