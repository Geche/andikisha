"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { LogoFull } from "@andikisha/ui";

export default function AccessDeniedPage() {
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — navigate to login regardless
    }
    window.location.assign(workspace ? `/${workspace}/login` : "/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-between px-4 py-8">
      <div className="w-full flex justify-center pt-2">
        <LogoFull className="h-[26px] w-auto" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm w-full max-w-[420px] px-8 py-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-light rounded-xl mb-5">
          <ShieldAlert size={24} className="text-amber-dark" />
        </div>

        <h1 className="text-[22px] font-bold text-near-black mb-1.5">Access denied</h1>
        <p className="text-[13.5px] text-neutral-500 mb-7">
          Your account does not have permission to view this page. If you think this
          is a mistake, contact your workspace administrator.
        </p>

        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="w-full bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-colors"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        <Link
          href={workspace ? `/${workspace}/login` : "/login"}
          className="block mt-3 text-[13px] font-medium text-brand-800 hover:underline"
        >
          Back to sign in
        </Link>
      </div>

      <p className="text-[12px] text-neutral-400 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>
    </div>
  );
}
