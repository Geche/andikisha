// Andikisha Marketing UI kit — features, metrics, testimonial, pricing, CTA, footer
function Features() {
  const items = [
    ["users-group", "Hiring & onboarding", "Post roles, track candidates and turn an offer into a fully onboarded teammate — paperwork included."],
    ["calendar-clock", "Attendance & leave", "Clock-ins, shifts and time-off approvals that stay in sync, with a clear view of who's in today."],
    ["report-money", "Global payroll", "Run accurate, compliant payroll across 27 markets. Taxes, pensions and payslips, handled."],
    ["receipt", "Expenses", "Capture, approve and reconcile spend before it ever reaches a payroll run."],
    ["target-arrow", "Performance", "Lightweight reviews and goals that actually get done, tied to real people data."],
    ["shield-check", "Compliance", "Audit trails, role-based access and data residency built in from day one."],
  ];
  return (
    <section style={{ ...wrap, padding: "96px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <div style={eyebrow}>One platform</div>
        <h2 style={h2}>Everything the people side of your business needs</h2>
        <p style={lead}>Stop stitching together five tools. Andikisha runs the full employee lifecycle from a single, calm workspace.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 48 }}>
        {items.map(([ic, t, d]) => (
          <div key={t} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 24, boxShadow: "var(--shadow-xs)" }}>
            <span style={{ width: 48, height: 48, borderRadius: 12, background: "var(--green-50)", color: "var(--green-700)",
              display: "flex", alignItems: "center", justifyContent: "center" }}><MIcon name={ic} size={24} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--fg1)", margin: "16px 0 7px", letterSpacing: "-0.01em" }}>{t}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--fg3)", margin: 0 }}>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section style={{ background: "var(--green-900)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(232,160,32,0.10)" }} />
      <div style={{ ...wrap, padding: "72px 24px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: 32, alignItems: "center" }}>
          <div>
            <div style={{ ...eyebrow, color: "var(--amber-400)" }}>By the numbers</div>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 0", lineHeight: 1.2 }}>Teams run smoother on Andikisha</h2>
          </div>
          {[["99.9%", "On-time payroll"], ["27", "Markets supported"], ["4.9/5", "Customer rating"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--amber-400)" }}>{n}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section style={{ ...wrap, padding: "96px 24px", textAlign: "center" }}>
      <MIcon name="quote" size={40} color="var(--green-200)" />
      <p style={{ fontSize: 28, lineHeight: 1.4, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.02em", maxWidth: 820, margin: "18px auto 0" }}>
        "We replaced three systems with Andikisha and ran our first global payroll in a week. Our team gets paid right, on time, in every market — and People Ops finally has their evenings back."</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 28 }}>
        <img src={MAV(6)} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg1)" }}>Kesi Mwangi</div>
          <div style={{ fontSize: 13.5, color: "var(--fg3)" }}>Head of People, Verdant</div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const tiers = [
    { name: "Starter", price: annual ? 6 : 8, blurb: "For small teams getting organized.", feats: ["Up to 25 employees", "Attendance & leave", "Single-country payroll", "Email support"], cta: "Start free", v: "secondary" },
    { name: "Growth", price: annual ? 12 : 15, blurb: "For scaling teams across markets.", feats: ["Unlimited employees", "Global payroll · 27 markets", "Expenses & performance", "Priority support", "Advanced reporting"], cta: "Start free trial", v: "primary", popular: true },
    { name: "Enterprise", price: null, blurb: "For complex orgs with custom needs.", feats: ["Everything in Growth", "SSO & SCIM", "Data residency", "Dedicated CSM", "Custom SLAs"], cta: "Talk to sales", v: "secondary" },
  ];
  return (
    <section style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ ...wrap, padding: "96px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <div style={eyebrow}>Pricing</div>
          <h2 style={h2}>Simple pricing that scales with your team</h2>
          <div style={{ display: "inline-flex", background: "#fff", border: "1px solid var(--border)", borderRadius: 999, padding: 4, marginTop: 22 }}>
            {[["Monthly", false], ["Annual −20%", true]].map(([l, a]) => (
              <button key={l} onClick={() => setAnnual(a)} style={{ border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
                fontSize: 13.5, fontWeight: 600, padding: "7px 16px", borderRadius: 999, whiteSpace: "nowrap",
                background: annual === a ? "var(--green-700)" : "transparent", color: annual === a ? "#fff" : "var(--fg2)" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 40, alignItems: "start" }}>
          {tiers.map(t => (
            <div key={t.name} style={{ background: "#fff", borderRadius: 16, padding: 28,
              border: t.popular ? "2px solid var(--green-700)" : "1px solid var(--border)",
              boxShadow: t.popular ? "var(--shadow-lg)" : "var(--shadow-xs)", position: "relative" }}>
              {t.popular && <span style={{ position: "absolute", top: 20, right: 20, ...pill, color: "var(--green-700)", borderColor: "var(--green-200)", fontSize: 12 }}>Most popular</span>}
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>{t.name}</div>
              <p style={{ fontSize: 13.5, color: "var(--fg3)", margin: "6px 0 18px", minHeight: 38 }}>{t.blurb}</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                {t.price !== null ? <>
                  <span style={{ fontSize: 40, fontWeight: 800, color: "var(--fg1)", letterSpacing: "-0.02em" }}>${t.price}</span>
                  <span style={{ fontSize: 14, color: "var(--fg3)", marginBottom: 8 }}>/employee/mo</span>
                </> : <span style={{ fontSize: 32, fontWeight: 800, color: "var(--fg1)" }}>Custom</span>}
              </div>
              <a href="#" style={{ ...btn(t.v), width: "100%", justifyContent: "center", marginTop: 18, boxSizing: "border-box" }}>{t.cta}</a>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11 }}>
                {t.feats.map(f => <span key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "var(--fg2)" }}>
                  <MIcon name="circle-check-filled" size={17} color="var(--green-600)" />{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ ...wrap, padding: "96px 24px" }}>
      <div style={{ background: "linear-gradient(120deg, var(--green-900), var(--green-700))", borderRadius: 24, padding: "64px 48px",
        textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -60, bottom: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(232,160,32,0.12)" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Ready to pay your people right?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", maxWidth: 480, margin: "16px auto 0", lineHeight: 1.6 }}>
            Join thousands of teams running calmer People Ops. Free for 14 days.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
            <a href="#" style={btn("accent", "lg")}>Start free trial</a>
            <a href="#" style={{ ...btn("secondary", "lg"), background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Book a demo</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = {
    Product: ["Hiring", "Attendance", "Payroll", "Expenses", "Performance"],
    Company: ["About", "Careers", "Blog", "Customers", "Contact"],
    Resources: ["Help center", "Guides", "API docs", "Status", "Security"],
  };
  return (
    <footer style={{ background: "var(--green-900)", color: "#fff" }}>
      <div style={{ ...wrap, padding: "64px 24px 32px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <img src="../../assets/brand/andikisha-type-white.svg" style={{ height: 22 }} />
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 16, maxWidth: 240, lineHeight: 1.6 }}>
            People, paid on time. The people platform for growing teams.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {["brand-x", "brand-linkedin", "brand-github"].map(b => (
              <span key={b} style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)" }}><MIcon name={b} size={18} /></span>
            ))}
          </div>
        </div>
        {Object.entries(cols).map(([h, items]) => (
          <div key={h}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{h}</div>
            {items.map(i => <a key={i} href="#" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 10 }}>{i}</a>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ ...wrap, padding: "20px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          <span>© 2026 Andikisha, Inc. All rights reserved.</span>
          <span style={{ display: "flex", gap: 20 }}><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Cookies</a></span>
        </div>
      </div>
    </footer>
  );
}

const eyebrow = { fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--green-600)" };
const h2 = { fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--fg1)", margin: "12px 0 0", lineHeight: 1.15 };
const lead = { fontSize: 17, lineHeight: 1.6, color: "var(--fg3)", margin: "16px 0 0" };
Object.assign(window, { Features, Metrics, Testimonial, Pricing, CTA, Footer });
