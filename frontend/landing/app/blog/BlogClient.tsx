"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import NewsletterSection from "@/components/layout/NewsletterSection";

const CATEGORIES = ["All", "Compliance", "Payroll", "HR Management"];

function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <article className={`card flex flex-col gap-4 ${featured ? "lg:flex-row lg:gap-8" : ""}`}>
      <div className={`bg-gradient-to-br from-brand-900 to-brand-800 rounded-xl flex flex-col items-start justify-between p-5 shrink-0 ${featured ? "lg:w-64 h-44" : "h-36"}`}>
        <span className="inline-block px-2.5 py-1 rounded-full bg-amber/20 text-amber text-[11px] font-bold uppercase tracking-wider">
          {post.category}
        </span>
        <div>
          <p className="font-display font-bold text-white text-[13px] leading-snug line-clamp-2">
            {post.title.slice(0, 55)}
          </p>
          <p className="text-[11px] text-white/40 font-mono mt-1">{post.date}</p>
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
                    ? "bg-amber text-ink-900"
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

      <NewsletterSection />
    </>
  );
}
