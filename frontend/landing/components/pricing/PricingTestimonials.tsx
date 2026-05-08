import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const TESTIMONIALS = [
  {
    quote:
      "We used to spend three days on payroll every month. With AndikishaHR it takes under an hour. The PAYE calculations just work — I don't have to verify them against the KRA table anymore.",
    name: "James O.",
    role: "Finance Manager · Mombasa",
  },
  {
    quote:
      "The pricing is the most honest I've seen. One number per employee, nothing hidden. After 18 months we've had zero KRA penalty letters — that alone justifies the cost.",
    name: "Grace N.",
    role: "CEO · Nairobi Tech SME",
  },
];

export default function PricingTestimonials() {
  return (
    <section className="py-20 bg-white border-b border-ink-100">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">What customers say</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            Businesses that switched.
            <br />
            Numbers that changed.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px]">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
              <p className="text-amber text-[28px] leading-none mb-3 font-serif">&ldquo;</p>
              <p className="text-[15px] text-ink-700 leading-[1.8] mb-5">{quote}</p>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{name}</p>
                <p className="text-[13px] text-ink-400">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
