import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center bg-surface-alt">
      <Container className="py-20 text-center">
        <p
          className="font-mono font-medium text-brand-100 leading-none mb-4"
          style={{ fontSize: "clamp(5rem, 12vw, 8rem)" }}
          aria-hidden
        >
          404
        </p>
        <h1 className="font-display font-bold text-[28px] text-ink-900 mb-4">
          This page does not exist.
        </h1>
        <p className="text-[17px] text-ink-600 max-w-[400px] mx-auto mb-8 leading-relaxed">
          You may have followed an old link or mistyped a URL. Head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="btn-primary"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="btn-outline-dark"
          >
            Contact support
          </Link>
        </div>
      </Container>
    </section>
  );
}
