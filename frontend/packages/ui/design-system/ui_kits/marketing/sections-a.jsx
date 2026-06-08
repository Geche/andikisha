// Andikisha Marketing UI kit — sections
const { useState } = React;
function MIcon({ name, size = 20, color, style = {} }) {
  return <LucideIcon name={name} size={size} color={color} style={style} />;
}
const MAV = (n) => `../../assets/avatars/avatar-0${n}.jpg`;

function Nav() {
  const links = ["Product", "Solutions", "Pricing", "Resources"];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ ...wrap, display: "flex", alignItems: "center", gap: 32, height: 68 }}>
        <img src="../../assets/brand/andikisha-full.svg" style={{ height: 26 }} />
        <nav style={{ display: "flex", gap: 26, marginLeft: 8 }}>
          {links.map(l => <a key={l} href="#" style={{ fontSize: 14.5, fontWeight: 500, color: "var(--fg2)", textDecoration: "none" }}>{l}</a>)}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <a href="#" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)", textDecoration: "none", whiteSpace: "nowrap" }}>Sign in</a>
          <a href="#" style={btn("primary")}>Book a demo</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 0%, var(--green-50), transparent 70%)" }} />
      <div style={{ ...wrap, position: "relative", textAlign: "center", padding: "84px 24px 0" }}>
        <span style={pill}><span style={{ color: "var(--amber-600)", fontWeight: 700 }}>New</span> · Payroll now runs in 27 markets <MIcon name="arrow-right" size={14} /></span>
        <h1 style={{ fontSize: 60, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--fg1)", margin: "22px auto 0", maxWidth: 760 }}>
          People, paid <span style={{ color: "var(--green-700)" }}>on time</span> — everywhere.</h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, color: "var(--fg3)", maxWidth: 560, margin: "20px auto 0" }}>
          Andikisha brings hiring, attendance, leave and payroll into one calm workspace — so your team is paid right, every time.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30 }}>
          <a href="#" style={btn("primary", "lg")}>Start free trial</a>
          <a href="#" style={btn("secondary", "lg")}><MIcon name="player-play" size={16} /> Watch the tour</a>
        </div>
        <div style={{ fontSize: 13, color: "var(--fg4)", marginTop: 14 }}>No credit card · Set up in minutes</div>
        <div style={{ marginTop: 48, marginBottom: -90 }}><ProductMock /></div>
      </div>
    </section>
  );
}

function ProductMock() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", borderRadius: 16, border: "1px solid var(--border)",
      boxShadow: "var(--shadow-xl)", overflow: "hidden", background: "#fff", textAlign: "left" }}>
      <div style={{ height: 40, background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7, padding: "0 14px" }}>
        {["#ef6f6f", "#f3c14b", "#5fcf80"].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 12, fontSize: 12, color: "var(--fg4)", fontFamily: "var(--font-mono)" }}>app.andikisha.co/dashboard</span>
      </div>
      <div style={{ display: "flex", height: 320 }}>
        <div style={{ width: 150, background: "var(--green-900)", padding: 16, flex: "none" }}>
          <img src="../../assets/brand/andikisha-type-white.svg" style={{ height: 14, marginBottom: 18 }} />
          {["layout-dashboard", "users-group", "calendar-clock", "report-money"].map((ic, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: 7, marginBottom: 3,
              background: i === 3 ? "var(--green-700)" : "transparent", color: i === 3 ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 12 }}>
              <MIcon name={ic} size={15} color={i === 3 ? "var(--amber-400)" : "inherit"} />{["Dashboard", "People", "Time", "Payroll"][i]}</div>
          ))}
        </div>
        <div style={{ flex: 1, background: "var(--bg2)", padding: 16 }}>
          <div style={{ background: "linear-gradient(120deg,var(--green-900),var(--green-700))", borderRadius: 10, padding: 14, color: "#fff" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>June payroll</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>$2,438,900</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
            {[["users-group", "1,848", "Employees"], ["circle-check", "99.9%", "On-time"], ["clock-x", "12", "Late"]].map(([ic, n, l], i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: i === 1 ? "var(--amber-500)" : "var(--green-700)",
                  color: i === 1 ? "var(--green-900)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><MIcon name={ic} size={16} /></span>
                <div style={{ fontSize: 19, fontWeight: 700, color: "var(--fg1)", marginTop: 8 }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--fg3)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Logos() {
  return (
    <section style={{ ...wrap, padding: "128px 24px 56px", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg4)" }}>Trusted by people teams at</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", alignItems: "center", marginTop: 26, opacity: 0.7 }}>
        {[["building-bank", "Meridian"], ["plant-2", "Verdant"], ["rocket", "Launchpad"], ["world", "Atlas Co"], ["bolt", "Voltic"], ["leaf", "Sappling"]].map(([ic, n]) => (
          <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 19, fontWeight: 700, color: "var(--fg2)", letterSpacing: "-0.01em" }}>
            <MIcon name={ic} size={22} color="var(--green-700)" />{n}</span>
        ))}
      </div>
    </section>
  );
}

const wrap = { maxWidth: 1120, margin: "0 auto", width: "100%" };
const pill = { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--fg2)", whiteSpace: "nowrap",
  background: "#fff", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 14px", boxShadow: "var(--shadow-xs)" };
function btn(variant, size = "md") {
  const base = { display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, textDecoration: "none",
    borderRadius: 9, cursor: "pointer", border: "1px solid transparent", fontSize: size === "lg" ? 16 : 14.5,
    whiteSpace: "nowrap", padding: size === "lg" ? "13px 22px" : "9px 17px" };
  if (variant === "primary") return { ...base, background: "var(--green-700)", color: "#fff" };
  if (variant === "accent") return { ...base, background: "var(--amber-500)", color: "var(--green-900)" };
  return { ...base, background: "#fff", color: "var(--fg1)", borderColor: "var(--border-strong)" };
}
Object.assign(window, { Nav, Hero, Logos, MIcon, MAV, wrap, pill, btn });
