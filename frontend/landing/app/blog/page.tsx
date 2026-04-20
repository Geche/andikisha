import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { BLOG_POSTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Kenya HR and payroll insights from the AndikishaHR team. PAYE updates, compliance guides, and practical HR advice for Kenyan SMEs.",
};

const CATEGORIES = ["All", "Compliance", "Payroll", "HR Management"];

function PostCard({
  post,
  featured = false,
}: {
  post: (typeof BLOG_POSTS)[number];
  featured?: boolean;
}) {
  return (
    <article
      className={`card flex flex-col gap-4 ${featured ? "lg:flex-row lg:gap-8" : ""}`}
    >
      {/* Placeholder image block */}
      <div
        className={`bg-brand-50 rounded-xl flex items-center justify-center shrink-0 ${
          featured ? "lg:w-64 h-44" : "h-44"
        }`}
      >
        <div className="text-center px-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 font-body block mb-1">
            {post.category}
          </span>
          <span className="text-[13px] font-mono text-brand-900 font-medium">
            {post.date}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 font-body">
            {post.category}
          </span>
          <span className="text-[12px] text-neutral-400">{post.readTime}</span>
        </div>

        <h2
          className={`font-display font-bold text-neutral-900 mb-3 leading-snug hover:text-brand-900 transition-colors ${
            featured ? "text-[24px]" : "text-[18px]"
          }`}
        >
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p
          className={`text-neutral-600 leading-relaxed mb-5 flex-1 ${
            featured ? "text-[16px]" : "text-[14px]"
          }`}
        >
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-800 hover:gap-2.5 transition-all duration-200 mt-auto"
        >
          Read article <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(232,160,32,0.1)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-[620px]">
            <AnimatedSection>
              <p className="section-eyebrow-white">The Blog</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h1 className="font-display text-[46px] md:text-[56px] font-extrabold text-white mb-5">
                Kenya HR and payroll, explained plainly.
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <p className="text-[17px] text-white/70 leading-relaxed">
                Compliance updates, payroll guides, and practical HR advice
                written for people actually running Kenyan businesses — not
                consultants billing by the hour.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="bg-surface-alt border-b border-neutral-200 py-4">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 font-body ${
                  cat === "All"
                    ? "bg-brand-900 text-white"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-200 hover:text-brand-900"
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
          {/* Featured post */}
          <AnimatedSection className="mb-8">
            <PostCard post={featured} featured />
          </AnimatedSection>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <AnimatedSection
                key={post.slug}
                delay={([0, 100, 200, 0, 100] as const)[i % 3]}
              >
                <PostCard post={post} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter strip */}
      <section className="py-16 bg-brand-50 border-t border-brand-100">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="max-w-[560px] mx-auto text-center">
            <AnimatedSection>
              <h2 className="font-display font-bold text-[28px] text-neutral-900 mb-3">
                Stay ahead of KRA changes.
              </h2>
              <p className="text-[15px] text-neutral-600 mb-6">
                We send one email when something changes that affects your
                payroll. No newsletters. No marketing. Just the compliance
                updates that matter.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="your@email.co.ke"
                  className="form-input flex-1"
                  aria-label="Email address"
                />
                <button type="submit" className="btn-primary shrink-0">
                  Subscribe
                </button>
              </form>
              <p className="text-[12px] text-neutral-400 mt-3">
                Unsubscribe any time. We respect your inbox.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
