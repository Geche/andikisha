import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/data";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

// Placeholder article body per post
const ARTICLE_BODY: Record<string, string[]> = {
  "paye-2026-bracket-changes": [
    "KRA revised the PAYE tax brackets effective January 2026 as part of the annual finance act updates. For most employers, this means recalculating monthly tax deductions for any employee earning above KES 24,000.",
    "The key change affects the third and fourth income bands. Employees earning between KES 32,333 and KES 500,000 per month now fall under a revised rate, with the personal relief amount also increased by KES 800 per month.",
    "If you are running payroll on spreadsheets, this means updating your tax tables manually — and ensuring the formulas are correct before the January payroll run. A missed bracket update typically results in under-deduction, which means the employee owes KRA the difference and the employer faces a late remittance risk.",
    "AndikishaHR updated the PAYE engine on December 28, 2025 — three days before the effective date. All accounts running on the platform processed January payroll with the correct rates automatically.",
    "The practical takeaway: if you are not on an automated system, check your tax table now. Do not wait until the April reconciliation to find out your January calculations were wrong.",
  ],
  "spreadsheet-payroll-cost": [
    "A 30-person company running payroll on spreadsheets loses an average of 28 hours per payroll cycle. At a fully-loaded cost of KES 3,000 per hour for a mid-level HR Officer, that is KES 84,000 per month — or KES 1,008,000 per year — in direct payroll processing cost.",
    "That number does not include corrections. When a deduction is miscalculated and a payslip needs to be reissued, the average correction takes 3.5 hours. A 30-person company running spreadsheet payroll experiences an average of 4.2 errors per month.",
    "Statutory filing errors carry additional costs. The minimum KRA penalty for late PAYE filing is KES 10,000. For incorrect PAYE calculation, the penalty is 5% of the underpaid amount plus interest at 1% per month. For a company underpaying by KES 50,000 per month, the annual accrued penalty reaches KES 42,000 before interest.",
    "The total cost of spreadsheet payroll for a 30-person Kenyan company: roughly KES 1.3M per year in time, corrections, and penalty risk. An automated payroll platform for the same company costs roughly KES 180,000 per year on the Growth plan.",
    "The question is not whether automation makes financial sense. The question is why so many businesses have not switched yet.",
  ],
};

const DEFAULT_BODY = [
  "This article covers one of the most frequently misunderstood areas of Kenya HR compliance. The details matter — a single miscalculation compounds over months before it surfaces in a KRA audit.",
  "We have written this guide based on questions from HR Managers and Finance Directors across 500+ Kenyan companies currently using AndikishaHR. The patterns are consistent: the same misunderstandings appear in businesses of 10 people and businesses of 200.",
  "The core principle is this: understand the rule before you implement it. Kenya's statutory compliance framework is logical once you understand the intent behind each obligation. When you see PAYE as a mechanism for progressive income tax rather than an arbitrary deduction, the bracket structure makes sense. When you understand NSSF as a retirement savings vehicle, the tier structure follows naturally.",
  "AndikishaHR handles the calculations automatically, but understanding what the platform is doing — and why — makes you a better HR Manager. You will spot anomalies faster, answer employee questions more confidently, and make better decisions about salary structures.",
  "If you have a specific compliance question not covered here, email us at hello@andikishahr.com. We respond within 2 hours on business days, and if your question is common enough, it becomes the next article.",
];

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const body = ARTICLE_BODY[slug] || DEFAULT_BODY;
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[820px] mx-auto px-6 relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-[14px] font-medium transition-colors mb-6"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-amber font-body">
              <Tag size={12} aria-hidden="true" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-white/50">
              <Clock size={12} aria-hidden="true" />
              {post.readTime}
            </span>
          </div>

          <h1 className="font-display text-[38px] md:text-[48px] font-extrabold text-white leading-[1.12] mb-5">
            {post.title}
          </h1>

          <p className="text-[17px] text-white/70 leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <p className="text-[13px] text-white/40">{post.date}</p>
        </div>
      </section>

      {/* Article body */}
      <article className="py-16 bg-white">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="prose prose-lg prose-neutral max-w-none">
            {body.map((para, i) => (
              <p
                key={i}
                className="text-[17px] text-neutral-700 leading-[1.85] mb-5"
              >
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-7">
            <h3 className="font-display font-bold text-[22px] text-neutral-900 mb-3">
              Tired of tracking this manually?
            </h3>
            <p className="text-[15px] text-neutral-600 mb-5">
              AndikishaHR handles all Kenya statutory compliance automatically.
              When KRA updates the brackets, the platform updates. Your next
              payroll just runs correctly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn-outline-dark">
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      <section className="py-16 bg-surface-alt border-t border-neutral-200">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <h2 className="font-display font-bold text-[24px] text-neutral-900 mb-8">
            More from the blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <div key={p.slug} className="card flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 font-body">
                  {p.category}
                </span>
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-display font-bold text-[17px] text-neutral-900 hover:text-brand-800 transition-colors leading-snug"
                >
                  {p.title}
                </Link>
                <p className="text-[14px] text-neutral-600 leading-relaxed flex-1">
                  {p.excerpt.slice(0, 120)}…
                </p>
                <Link
                  href={`/blog/${p.slug}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-800 hover:gap-2 transition-all duration-200"
                >
                  Read <ArrowLeft size={13} className="rotate-180" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
