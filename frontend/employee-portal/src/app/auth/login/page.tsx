"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { LogoFull } from "@andikisha/ui";

const TESTIMONIALS = [
  {
    quote: "I can check my payslip, apply for leave, and see my attendance — all from my phone before I even get to the office.",
    name: "James Otieno",
    title: "Finance Officer, Mombasa Trading Co.",
  },
  {
    quote: "The leave approval process that used to take a week of back-and-forth emails now takes one tap. AndikishaHR changed everything.",
    name: "Grace Kamau",
    title: "Senior Accountant, Nairobi Foods Ltd",
  },
  {
    quote: "Seeing my payslip broken down — PAYE, SHIF, Housing Levy — finally made sense. I trust my employer more because of this.",
    name: "David Mwangi",
    title: "Operations Lead, Rift Valley Logistics",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

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

  const testimonial = TESTIMONIALS[slide];

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

      {/* ── Right panel — brand image with testimonial overlay ── */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B3D2E] overflow-hidden">
        {/* Subtle texture / gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B3D2E]/60 via-transparent to-[#02110C]/80" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Testimonial — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-14 pb-14 relative z-10">
          <div className="absolute bottom-0 left-0 right-0 px-14 pb-14">
            <p className="text-[26px] font-bold text-white leading-snug mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[15px] font-bold text-white">{testimonial.name}</p>
                <p className="text-[13px] text-white/60 mt-0.5">{testimonial.title}</p>
              </div>
              {/* Navigation arrows */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSlide((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => setSlide((s) => (s + 1) % TESTIMONIALS.length)}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
