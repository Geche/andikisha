import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-surface-alt">
      <div className="text-center px-6 py-20">
        <p className="font-mono text-[80px] font-medium text-brand-100 leading-none mb-2">
          404
        </p>
        <h1 className="font-display font-extrabold text-[32px] text-neutral-900 mb-4">
          This page does not exist.
        </h1>
        <p className="text-[17px] text-neutral-600 max-w-[420px] mx-auto mb-8 leading-relaxed">
          You may have followed an old link or mistyped a URL. Either way, head
          back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/contact" className="btn-outline-dark">
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
