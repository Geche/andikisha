import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import Container from "@/components/ui/Container";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareBar from "@/components/blog/ShareBar";
import NewsletterSection from "@/components/layout/NewsletterSection";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  const author = post.author ?? "AndikishaHR";
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: author }],
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.lastModified ?? post.date,
      authors: [author],
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const sameCategory = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);
  const fillCount = 3 - sameCategory.length;
  const otherPosts = fillCount > 0
    ? allPosts.filter((p) => p.slug !== slug && p.category !== post.category).slice(0, fillCount)
    : [];
  const related = [...sameCategory, ...otherPosts];

  const author = post.author ?? "AndikishaHR";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.lastModified ?? post.date,
    author: { "@type": "Organization", name: author },
    publisher: {
      "@type": "Organization",
      name: "AndikishaHR",
      logo: { "@type": "ImageObject", url: "https://andikishahr.com/logomark.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://andikishahr.com/blog/${slug}` },
    image: "https://andikishahr.com/opengraph-image",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ReadingProgress />

      {/* Hero */}
      <section className="bg-brand-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.07)_0%,transparent_70%)] pointer-events-none" aria-hidden />
        <div className="max-w-[820px] mx-auto px-6 relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-[14px] font-medium transition-colors mb-6 focus-ring rounded-sm"
          >
            <ArrowLeft size={14} aria-hidden /> Back to blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber">
              <Tag size={11} aria-hidden />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-white/50">
              <Clock size={11} aria-hidden />
              {post.readTime}
            </span>
          </div>

          <h1
            className="font-display font-bold text-white leading-[1.1] mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
          >
            {post.title}
          </h1>
          <p className="text-[17px] text-brand-100/70 leading-relaxed mb-5">{post.excerpt}</p>
          <p className="text-[13px] text-white/35 font-mono">{post.date}</p>
        </div>
      </section>

      {/* Article */}
      <article className="py-16 bg-white">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="prose prose-lg prose-neutral max-w-none">
            <MDXRemote source={post.content} />
          </div>

          <ShareBar title={post.title} />

          {/* Inline CTA */}
          <div className="mt-4 bg-brand-50 border border-brand-100 rounded-2xl p-7">
            <h3 className="font-display font-bold text-[20px] text-ink-900 mb-3">
              Tired of tracking this manually?
            </h3>
            <p className="text-[15px] text-ink-600 mb-5 leading-relaxed">
              AndikishaHR handles all Kenya statutory compliance automatically.
              When KRA updates the brackets, the platform updates. Your next payroll just runs correctly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary">Start free trial</Link>
              <Link href="/demo" className="btn-outline-dark">Book a demo</Link>
            </div>
          </div>
        </div>
      </article>

      <NewsletterSection />

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 bg-surface-alt border-t border-ink-200">
          <Container>
            <h2 className="font-display font-bold text-[22px] text-ink-900 mb-8">
              More from {post.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <div key={p.slug} className="card flex flex-col gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">{p.category}</span>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="font-display font-bold text-[16px] text-ink-900 hover:text-brand-700 transition-colors leading-snug"
                  >
                    {p.title}
                  </Link>
                  <p className="text-[13px] text-ink-600 leading-relaxed flex-1">
                    {p.excerpt.slice(0, 115)}…
                  </p>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:gap-2.5 transition-all duration-200"
                  >
                    Read <ArrowLeft size={12} className="rotate-180" aria-hidden />
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
