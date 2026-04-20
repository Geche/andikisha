import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Mail, Phone, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the AndikishaHR team. Sales, support, and partnerships — we respond within 2 hours on business days.",
};

const CONTACT_ITEMS = [
  {
    icon: <Mail size={20} aria-hidden="true" />,
    label: "Email us",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
  },
  {
    icon: <Phone size={20} aria-hidden="true" />,
    label: "Call or WhatsApp",
    value: COMPANY.phone,
    href: COMPANY.whatsapp,
  },
  {
    icon: <MapPin size={20} aria-hidden="true" />,
    label: "Find us",
    value: COMPANY.address,
    href: "https://maps.google.com/?q=Westlands+Nairobi",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(39,168,112,0.1)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">Get in Touch</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-display text-[46px] md:text-[56px] font-extrabold text-white max-w-[580px] mx-auto mb-5">
              We are based in Nairobi. We respond fast.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/70 max-w-[480px] mx-auto">
              Sales, support, partnerships, or a general question — send a
              message and we will get back to you within 2 hours on business
              days.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Two-column */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — contact details */}
            <div>
              <AnimatedSection>
                <h2 className="font-display font-bold text-[32px] text-neutral-900 mb-4">
                  Contact details
                </h2>
                <p className="text-[16px] text-neutral-600 leading-relaxed mb-10">
                  Our team is in Nairobi (EAT, UTC+3). We are available Monday
                  to Friday, 8am – 6pm. For urgent payroll issues, we also
                  offer weekend support on Growth and Scale plans.
                </p>
              </AnimatedSection>

              <div className="flex flex-col gap-6 mb-10">
                {CONTACT_ITEMS.map((item, i) => (
                  <AnimatedSection key={item.label} delay={([0, 100, 200] as const)[i]}>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900 shrink-0 group-hover:bg-brand-100 transition-colors duration-200">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400 font-body mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-[16px] font-medium text-neutral-900 group-hover:text-brand-800 transition-colors duration-200">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  </AnimatedSection>
                ))}
              </div>

              {/* WhatsApp card */}
              <AnimatedSection delay={300}>
                <a
                  href={COMPANY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#25d366]/10 border border-[#25d366]/20 rounded-2xl p-5 hover:bg-[#25d366]/15 transition-colors duration-200"
                >
                  <div className="w-12 h-12 bg-[#25d366] rounded-full flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-neutral-900">
                      Prefer WhatsApp?
                    </p>
                    <p className="text-[14px] text-neutral-600">
                      Message us directly — we respond within the hour.
                    </p>
                  </div>
                </a>
              </AnimatedSection>
            </div>

            {/* Right — Form */}
            <AnimatedSection delay={200}>
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-[0_8px_40px_rgba(11,61,46,0.06)]">
                <h2 className="font-display font-bold text-[24px] text-neutral-900 mb-2">
                  Send us a message
                </h2>
                <p className="text-[14px] text-neutral-600 mb-7">
                  We will reply to the email you provide, usually within 2 hours.
                </p>
                <ContactForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
