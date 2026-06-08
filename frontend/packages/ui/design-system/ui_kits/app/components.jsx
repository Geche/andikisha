// Andikisha App UI kit — shared primitives
// Exposed on window for cross-file (Babel) sharing.
const { useState, useMemo } = React;

// ---- Icon (Lucide SVG, via shared LucideIcon) ----
function Icon({ name, size = 18, className = "", style = {} }) {
  return <LucideIcon name={name} size={size} className={className} style={style} />;
}

// ---- Button ----
function Button({ children, variant = "primary", size = "md", icon, iconRight, onClick, type, full, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    fontFamily: "var(--font-sans)", fontWeight: 600, border: "1px solid transparent",
    borderRadius: 8, cursor: "pointer", lineHeight: 1, whiteSpace: "nowrap",
    transition: "background var(--dur) var(--ease-out), color var(--dur)",
    width: full ? "100%" : undefined,
  };
  const sizes = {
    sm: { padding: "7px 12px", fontSize: 13 },
    md: { padding: "9px 16px", fontSize: 14 },
    lg: { padding: "12px 20px", fontSize: 15 },
  };
  const variants = {
    primary: { background: "var(--green-700)", color: "#fff" },
    accent: { background: "var(--amber-500)", color: "var(--green-900)" },
    secondary: { background: "#fff", color: "var(--fg1)", borderColor: "var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--green-700)" },
    danger: { background: "var(--danger)", color: "#fff" },
  };
  const [h, setH] = useState(false);
  const hov = {
    primary: { background: "var(--green-800)" }, accent: { background: "var(--amber-600)" },
    secondary: { background: "var(--bg2)" }, ghost: { background: "var(--green-50)" },
    danger: { background: "#b91c1c" },
  };
  return (
    <button type={type} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...(h ? hov[variant] : {}), ...style }}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

// ---- Badge ----
function Badge({ children, tone = "neutral", dot }) {
  const tones = {
    green: ["var(--green-50)", "var(--green-700)", "var(--green-600)"],
    amber: ["var(--amber-50)", "var(--amber-700)", "var(--amber-500)"],
    success: ["var(--success-bg)", "var(--success)", "var(--success)"],
    warning: ["var(--warning-bg)", "#b45309", "var(--warning)"],
    danger: ["var(--danger-bg)", "var(--danger)", "var(--danger)"],
    neutral: ["var(--neutral-100)", "var(--fg2)", "var(--fg4)"],
  };
  const [bg, fg, d] = tones[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 999, background: bg, color: fg, lineHeight: 1.4 }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: d }} />}
      {children}
    </span>
  );
}

// ---- Avatar ----
const AV = (n) => `../../assets/avatars/avatar-0${n}.jpg`;
function Avatar({ src, name, size = 38, status }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("") : "";
  return (
    <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
      {src
        ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
        : <span style={{ width: size, height: size, borderRadius: "50%", background: "var(--green-700)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: size * 0.38 }}>{initials}</span>}
      {status && <span style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.26, height: size * 0.26,
        borderRadius: "50%", background: status === "online" ? "var(--success)" : "var(--neutral-400)",
        border: "2px solid #fff" }} />}
    </span>
  );
}

// ---- Card + Card header (with green accent bar) ----
function Card({ children, style = {}, pad = true }) {
  return <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
    boxShadow: "var(--shadow-xs)", padding: pad ? 18 : 0, ...style }}>{children}</div>;
}
function CardHead({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--fg1)", display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 4, height: 18, borderRadius: 2, background: "var(--green-700)" }} />{title}
      </h3>
      {action}
    </div>
  );
}

// ---- Stat tile ----
function Stat({ icon, tone = "green", label, value, sub, delta, up }) {
  const chip = tone === "amber" ? { background: "var(--amber-500)", color: "var(--green-900)" }
    : tone === "ink" ? { background: "var(--green-900)", color: "#fff" }
    : { background: "var(--green-700)", color: "#fff" };
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", flex: "none", ...chip }}><Icon name={icon} size={22} /></span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--fg1)", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 5 }}>{sub}</div>
        </div>
        {delta && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
            color: "var(--fg1)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 999, padding: "2px 4px 2px 9px" }}>
            {delta}
            <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", background: up ? "var(--success)" : "var(--danger)" }}>
              <Icon name={up ? "arrow-up-right" : "arrow-down-right"} size={14} />
            </span>
          </span>
        )}
      </div>
    </Card>
  );
}

// ---- Mini sparkbar chart (CSS bars) ----
function BarChart({ data, colors }) {
  const max = Math.max(...data.flat());
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150, padding: "0 2px" }}>
      {data.map((group, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 130, width: "100%", justifyContent: "center" }}>
            {group.map((v, j) => (
              <div key={j} title={v} style={{ width: 10, height: `${(v / max) * 100}%`,
                background: colors[j], borderRadius: "3px 3px 0 0" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Icon, Button, Badge, Avatar, AV, Card, CardHead, Stat, BarChart });
