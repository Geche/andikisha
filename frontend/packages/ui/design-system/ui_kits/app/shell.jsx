// Andikisha App UI kit — shell: Sidebar + Topbar
const NAV = [
  { section: "Main" },
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { id: "employees", label: "Employees", icon: "users-group", badge: "1,848" },
  { id: "attendance", label: "Attendance", icon: "calendar-clock" },
  { id: "leave", label: "Leave", icon: "plane-departure", badge: "6" },
  { id: "payroll", label: "Payroll", icon: "report-money" },
  { section: "Organization" },
  { id: "recruitment", label: "Recruitment", icon: "user-search" },
  { id: "performance", label: "Performance", icon: "target-arrow" },
  { id: "expenses", label: "Expenses", icon: "receipt" },
  { id: "reports", label: "Reports", icon: "chart-histogram" },
  { section: "System" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function Sidebar({ active, onNav }) {
  const [hover, setHover] = useState(null);
  return (
    <aside style={{ width: 256, background: "var(--green-900)", color: "#fff", flex: "none",
      display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="../../assets/brand/andikisha-mark-white.svg" style={{ width: 26, height: 26 }} />
        <img src="../../assets/brand/andikisha-type-white.svg" style={{ height: 17 }} />
      </div>
      <div style={{ padding: "0 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 11px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          <Icon name="search" size={16} /> Search…
          <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}>⌘K</span>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 12px 18px" }}>
        {NAV.map((item, i) => item.section ? (
          <div key={i} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.32)", padding: "16px 12px 7px" }}>{item.section}</div>
        ) : (
          <a key={item.id} onClick={() => onNav(item.id)}
            onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
            style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 8,
              cursor: "pointer", fontSize: 13.5, fontWeight: active === item.id ? 600 : 500, marginBottom: 2,
              position: "relative",
              color: active === item.id ? "#fff" : "rgba(255,255,255,0.62)",
              background: active === item.id ? "var(--green-700)" : hover === item.id ? "rgba(255,255,255,0.06)" : "transparent" }}>
            {active === item.id && <span style={{ position: "absolute", left: -12, top: 8, bottom: 8, width: 3,
              borderRadius: 3, background: "var(--amber-500)" }} />}
            <Icon name={item.icon} size={18} style={{ color: active === item.id ? "var(--amber-400)" : "inherit" }} />
            {item.label}
            {item.badge && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600,
              background: active === item.id ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)", padding: "1px 7px", borderRadius: 999 }}>{item.badge}</span>}
          </a>
        ))}
      </nav>
      <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={AV(1)} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Amani Okello</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>HR Admin</div>
          </div>
          <Icon name="dots-vertical" size={18} style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, crumb, onLogout }) {
  return (
    <header style={{ height: 64, background: "#fff", borderBottom: "1px solid var(--border)", flex: "none",
      display: "flex", alignItems: "center", gap: 16, padding: "0 24px", position: "sticky", top: 0, zIndex: 5 }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--fg1)", letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--fg3)", display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
          <Icon name="home" size={12} /> Home <span style={{ color: "var(--fg4)" }}>/</span> <span>{crumb || title}</span>
        </div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <Button variant="secondary" size="sm" icon="calendar-due">Jun 2026</Button>
        <Button variant="primary" size="sm" icon="plus">Add employee</Button>
        <span style={{ width: 1, height: 28, background: "var(--border)", margin: "0 2px" }} />
        <button style={iconBtn}><Icon name="bell" size={19} /><span style={{ position: "absolute", top: 7, right: 7,
          width: 7, height: 7, borderRadius: "50%", background: "var(--amber-500)", border: "1.5px solid #fff" }} /></button>
        <button style={iconBtn} onClick={onLogout} title="Log out"><Icon name="logout" size={19} /></button>
        <Avatar src={AV(1)} size={34} status="online" />
      </div>
    </header>
  );
}
const iconBtn = { position: "relative", width: 38, height: 38, borderRadius: 8, border: "1px solid var(--border)",
  background: "#fff", color: "var(--fg2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

Object.assign(window, { Sidebar, Topbar, NAV });
