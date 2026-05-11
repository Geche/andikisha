"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

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
      <div className="relative flex flex-col w-full max-w-[480px] bg-white px-14 py-12 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-auto">
          <span className="w-7 h-7 rounded-md bg-[#0B3D2E] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </span>
          <span className="text-[15px] font-bold text-[#02110C] tracking-tight">AndikishaHR</span>
        </div>

        {/* Form — vertically centred */}
        <div className="flex flex-col justify-center flex-1 py-8">
          <h1 className="text-[26px] font-bold text-[#02110C] leading-tight mb-8">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#344054] mb-1.5">
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
              <label className="block text-[13px] font-medium text-[#344054] mb-1.5">
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
        <p className="text-[12px] text-[#98A2B3]">
          &copy;2026, AndikishaHR All rights reserved
        </p>
      </div>

      {/* ── Right panel — brand / testimonial ── */}
      <div className="hidden lg:flex flex-1 flex-col bg-[#F2F4F7] px-16 py-16 overflow-hidden">
        {/* Testimonial */}
        <div className="max-w-xl mt-8">
          <p className="text-[32px] font-bold text-[#101828] leading-snug">
            I can check my payslip, apply for leave, and see my attendance —
            all from my phone before I even get to the office.
          </p>
          <div className="flex items-start justify-between mt-6">
            <div>
              <p className="text-[14px] font-semibold text-[#101828]">— James Otieno</p>
              <p className="text-[13px] text-[#667085]">Finance Officer, Mombasa Trading Co.</p>
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
        <div className="mt-12 flex-1 relative">
          <div className="absolute inset-0 flex items-start">
            <div
              className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/60"
              style={{ background: "#fff", maxHeight: "420px" }}
            >
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F9FAFB] border-b border-gray-200">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FDA29B]"/>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEF0C7]"/>
                <div className="w-2.5 h-2.5 rounded-full bg-[#D1FAE5]"/>
                <div className="flex-1 mx-4 h-5 bg-[#F2F4F7] rounded-full text-[10px] text-[#98A2B3] flex items-center px-3">
                  me.andikishahr.co.ke
                </div>
              </div>
              {/* Mock employee dashboard */}
              <div className="flex" style={{ height: "360px" }}>
                {/* Sidebar */}
                <div className="w-44 flex-shrink-0 border-r border-gray-100 bg-white px-3 py-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 px-2 mb-3">
                    <div className="w-5 h-5 rounded bg-[#0B3D2E]"/>
                    <div className="h-2.5 w-20 bg-[#0B3D2E] rounded-full opacity-80"/>
                  </div>
                  {["Home","Payslips","Leave","Attendance","Profile"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${i === 0 ? "bg-[#E8F5F0]" : ""}`}
                    >
                      <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-[#0B3D2E]" : "bg-gray-200"}`}/>
                      <div className={`h-2 rounded-full ${i === 0 ? "w-8 bg-[#0B3D2E]" : "w-12 bg-gray-200"}`}/>
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 bg-[#F8F7F4] p-5 overflow-hidden">
                  <div className="h-3 w-24 bg-gray-800 rounded-full mb-1.5"/>
                  <div className="h-2 w-36 bg-gray-200 rounded-full mb-5"/>
                  {/* Cards row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { bg: "#D1FAE5", label: "Leave Balance", val: "18 days" },
                      { bg: "#FEF3C7", label: "This Month", val: "KES 85,000" },
                    ].map(({ bg, label, val }) => (
                      <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="w-6 h-6 rounded-md mb-2" style={{ background: bg }}/>
                        <div className="h-2 w-16 bg-gray-200 rounded-full mb-1.5"/>
                        <div className="h-3 w-20 bg-gray-700 rounded-full"/>
                      </div>
                    ))}
                  </div>
                  {/* Recent payslips mock */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="h-2 w-20 bg-gray-300 rounded-full"/>
                    </div>
                    {["Apr 2026","Mar 2026","Feb 2026"].map(month => (
                      <div key={month} className="px-4 py-2.5 border-b border-gray-50 flex items-center gap-4">
                        <div className="w-7 h-7 rounded-md bg-[#E8F5F0] flex-shrink-0"/>
                        <div className="flex-1">
                          <div className="h-2 w-16 bg-gray-200 rounded-full mb-1"/>
                          <div className="h-2 w-12 bg-gray-100 rounded-full"/>
                        </div>
                        <div className="h-2 w-10 bg-[#D1FAE5] rounded-full"/>
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
