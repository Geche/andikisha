import NewsletterForm from "@/components/ui/NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="bg-brand-900 py-12 px-14">
      <div className="mx-auto max-w-[1120px] flex items-center justify-between gap-10 flex-wrap">
        <div>
          <h3 className="text-[22px] font-bold text-white tracking-[-0.01em] mb-1.5">
            Stay ahead of compliance changes.
          </h3>
          <p className="text-[14px] text-white/45">
            Statutory updates, platform news, and payroll guidance — straight to your inbox.
          </p>
        </div>
        <div className="shrink-0 min-w-[320px]">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
