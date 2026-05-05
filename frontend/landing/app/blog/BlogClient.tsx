"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

const CATEGORIES = ["All", "Compliance", "Payroll", "HR Management"];

function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <article className={`card flex flex-col gap-4 ${featured ? "lg:flex-row lg:gap-8" : ""}`}>
      <div className={`bg-brand-50 rounded-xl flex items-center justify-center shrink-0 ${featured ? "lg:w-64 h-44" : "h-44"}`}>
        <div className="text-center px-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
            {post.category}
          </span>
          <span className="text-[13px] font-mono text-brand-900 font-medium">{post.date}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">{post.category}</span>
          <span className="text-[12px] text-ink-400">{post.readTime}</span>
        </div>

        <h2 className={`font-display font-bold text-ink-900 mb-3 leading-snug hover:text-brand-900 transition-colors ${featured ? "text-[22px]" : "text-[17px]"}`}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p className={`text-ink-600 leading-relaxed mb-5 flex-1 ${featured ? "text-[15px]" : "text-[14px]"}`}>
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:gap-2.5 transition-all duration-200 mt-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          Read article <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.ok) setSubscribed(true);
      else setError(result.error ?? "Something went wrong. Please try again.");
    });
  };

  if (subscribed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-brand-700 font-semibold text-[15px]">
          <CheckCircle size={18} aria-hidden /> You&apos;re subscribed.
        </div>
        <p className="text-[13px] text-ink-400">We&apos;ll only email when something in Kenya payroll compliance changes.</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit} noValidate>
      <div className="flex-1">
        <input
          type="email"
          placeholder="your@email.co.ke"
          className="form-input w-full"
          aria-label="Email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
        />
        {error && (
          <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-error">
            <AlertCircle size={13} aria-hidden /> {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}

export default function BlogClient({ posts }: { posts: PostMeta[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Category filter */}
      <div className="bg-surface-alt border-b border-ink-200 py-4">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 ${
                  activeCategory === cat
                    ? "bg-brand-900 text-white"
                    : "bg-white border border-ink-200 text-ink-600 hover:border-brand-700 hover:text-brand-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <section className="py-16 bg-surface-alt">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          {filtered.length === 0 ? (
            <p className="text-center text-ink-400 py-16">No posts in this category yet.</p>
          ) : (
            <>
              {featured && <div className="mb-8"><PostCard post={featured} featured /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => <PostCard key={post.slug} post={post} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter strip */}
      <section className="py-16 bg-brand-50 border-t border-brand-100">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="max-w-[560px] mx-auto text-center">
            <h2 className="font-display font-bold text-[26px] text-ink-900 mb-3">Stay ahead of KRA changes.</h2>
            <p className="text-[15px] text-ink-600 mb-6">
              We send one email when something changes that affects your payroll. No newsletters. No marketing.
            </p>
            <NewsletterForm />
            <p className="text-[12px] text-ink-400 mt-3">Unsubscribe any time. We respect your inbox.</p>
          </div>
        </div>
      </section>
    </>
  );
}
