import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { getAllPosts } from "@/lib/blog";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Kenya HR and payroll insights from the AndikishaHR team. PAYE updates, compliance guides, and practical HR advice for Kenyan SMEs.",
};

export default async function BlogPage() {
  const posts = getAllPosts();

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

      <BlogClient posts={posts} />
    </>
  );
}
