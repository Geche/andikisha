"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        setEmail("");
      }
    } catch {
      setError("Failed to subscribe. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="text-[13px] text-brand-500 font-medium mt-4">
        You&apos;re subscribed. We&apos;ll email you when compliance rates change.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4" noValidate>
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/50 mb-2">
        Compliance updates — no marketing.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === "loading"}
          className="flex-1 h-9 px-3 rounded-lg bg-white/[0.07] border border-white/[0.12] text-white text-[13px] placeholder:text-white/30 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label="Subscribe"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-700 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 shrink-0"
        >
          <ArrowRight size={15} />
        </button>
      </div>
      {state === "error" && (
        <p className="text-[12px] text-red-400 mt-1.5">{error}</p>
      )}
    </form>
  );
}
