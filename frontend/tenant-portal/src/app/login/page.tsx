"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoFull } from "@andikisha/ui";

function WorkspaceEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workspace, setWorkspace] = useState(searchParams.get("workspace") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = workspace.trim().toLowerCase();
    if (!slug) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/auth/resolve-workspace?workspace=${encodeURIComponent(slug)}`
      );
      if (res.status === 404) {
        setError("Workspace not found. Check your welcome email or contact your administrator.");
        return;
      }
      if (res.status === 403) {
        setError("This workspace is not available. Contact support@andikisha.co.ke.");
        return;
      }
      if (!res.ok) {
        setError("Unable to verify workspace. Please try again.");
        return;
      }
      router.push(`/${slug}/login`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
          Workspace
        </label>
        <input
          type="text"
          value={workspace}
          onChange={(e) =>
            setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          placeholder="your-workspace"
          required
          autoFocus
          autoComplete="organization"
          disabled={loading}
          className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400 font-mono transition-colors disabled:opacity-50"
        />
        <p className="mt-1.5 text-[11.5px] text-neutral-400">
          Your workspace — provided by Andikisha during account setup.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !workspace.trim()}
        className="w-full bg-brand-900 hover:bg-brand-800 active:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] h-11 rounded-lg transition-colors"
      >
        {loading ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}

export default function LoginPage() {
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
          <h1 className="text-[22px] font-bold text-near-black mb-1">Sign In</h1>
          <p className="text-[14px] text-neutral-500">Enter your workspace to continue</p>
        </div>
        <Suspense fallback={null}>
          <WorkspaceEntryForm />
        </Suspense>
      </div>

      <p className="text-[12px] text-white/50 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>
    </div>
  );
}
