import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
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
      <section className="bg-brand-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(232,160,32,0.08)_0%,transparent_65%)] pointer-events-none" aria-hidden />
        <Container className="relative z-10">
          <div className="max-w-[620px]">
            <Eyebrow light className="mb-5">The Blog</Eyebrow>
            <h1
              className="font-display font-bold text-white mb-5"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: "1.08", letterSpacing: "-0.02em" }}
            >
              Kenya HR and payroll, explained plainly.
            </h1>
            <p className="text-[17px] text-brand-100/70 leading-relaxed max-w-[500px]">
              Compliance updates, payroll guides, and practical HR advice written
              for people actually running Kenyan businesses — not consultants
              billing by the hour.
            </p>
          </div>
        </Container>
      </section>

      <BlogClient posts={posts} />
    </>
  );
}
