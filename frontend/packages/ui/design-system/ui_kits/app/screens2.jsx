// Andikisha App UI kit — Leave, Payroll, Login
const LEAVE = [
  { name: "Kesi Mwangi", av: AV(6), type: "Annual leave", from: "12 Jun", to: "14 Jun", days: 3, reason: "Family trip", state: "Pending" },
  { name: "Tomas Werner", av: AV(4), type: "Sick leave", from: "10 Jun", to: "10 Jun", days: 1, reason: "Flu", state: "Pending" },
  { name: "Priya Nair", av: AV(2), type: "Remote work", from: "16 Jun", to: "20 Jun", days: 5, reason: "Relocating", state: "Pending" },
  { name: "Sam Ndlovu", av: AV(5), type: "Annual leave", from: "3 Jun", to: "5 Jun", days: 3, reason: "Personal", state: "Approved" },
  { name: "Lena Costa", av: AV(3), type: "Parental leave", from: "1 Jun", to: "28 Jun", days: 20, reason: "Maternity", state: "Approved" },
  { name: "Joseph Kim", av: AV(7), type: "Sick leave", from: "28 May", to: "29 May", days: 2, reason: "Dental", state: "Declined" },
];
const leaveTone = { Pending: "warning", Approved: "success", Declined: "danger" };

function Leave() {
  const [rows, setRows] = useState(LEAVE);
  const [tab, setTab] = useState("All");
  const set = (i, state) => setRows(r => r.map((x, j) => j === i ? { ...x, state } : x));
  const shown = rows.filter(r => tab === "All" || r.state === tab);
  const tabs = ["All", "Pending", "Approved", "Declined"];
  return (
    <PageWrap>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <Stat icon="plane-departure" tone="amber" label="Pending requests" value={rows.filter(r => r.state === "Pending").length} sub="Awaiting your review" />
        <Stat icon="calendar-check" label="Approved (Jun)" value="38" sub="This month" />
        <Stat icon="beach" tone="ink" label="On leave today" value="4" sub="Across the company" />
        <Stat icon="sum" label="Avg. balance" value="12.4" sub="Days per employee" />
      </div>
      <Card pad={false}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--neutral-100)" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)",
              background: tab === t ? "var(--green-700)" : "transparent", color: tab === t ? "#fff" : "var(--fg2)" }}>
              {t}{t === "Pending" && <span style={{ marginLeft: 6, fontSize: 11, background: tab === t ? "rgba(255,255,255,.2)" : "var(--amber-50)",
                color: tab === t ? "#fff" : "var(--amber-700)", padding: "1px 6px", borderRadius: 999 }}>{rows.filter(r => r.state === "Pending").length}</span>}
            </button>
          ))}
          <div style={{ marginLeft: "auto" }}><Button variant="secondary" size="sm" icon="download">Export</Button></div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead><tr style={{ background: "var(--bg2)", textAlign: "left", color: "var(--fg3)", fontSize: 12 }}>
            {["Employee", "Type", "Dates", "Days", "Reason", "Status", "Action"].map((h, i) =>
              <th key={i} style={{ padding: "11px 18px", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {shown.map((r) => {
              const i = rows.indexOf(r);
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--neutral-100)" }}>
                  <td style={{ padding: "12px 18px" }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Avatar src={r.av} size={34} /><span style={{ fontWeight: 600, color: "var(--fg1)" }}>{r.name}</span></div></td>
                  <td style={{ padding: "12px 18px", color: "var(--fg2)" }}>{r.type}</td>
                  <td style={{ padding: "12px 18px", color: "var(--fg2)" }}>{r.from} – {r.to}</td>
                  <td style={{ padding: "12px 18px", fontWeight: 600, color: "var(--fg1)" }}>{r.days}</td>
                  <td style={{ padding: "12px 18px", color: "var(--fg3)" }}>{r.reason}</td>
                  <td style={{ padding: "12px 18px" }}><Badge tone={leaveTone[r.state]} dot>{r.state}</Badge></td>
                  <td style={{ padding: "12px 18px" }}>
                    {r.state === "Pending" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => set(i, "Approved")} style={ghostIcon("var(--success)")}><Icon name="check" size={16} /></button>
                        <button onClick={() => set(i, "Declined")} style={ghostIcon("var(--danger)")}><Icon name="x" size={16} /></button>
                      </div>
                    ) : <span style={{ color: "var(--fg4)", fontSize: 12.5 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}

function Payroll() {
  const [run, setRun] = useState(false);
  const rows = TEAM.slice(0, 6).map((p, i) => ({ ...p, gross: [9200, 7400, 8800, 6500, 7100, 4800][i], status: i < 4 ? "Ready" : "Review" }));
  const total = rows.reduce((s, r) => s + r.gross, 0);
  return (
    <PageWrap>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Card style={{ background: "linear-gradient(120deg, var(--green-900), var(--green-700))", border: "none", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>June 2026 payroll run</div>
              <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8 }}>${(total).toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Gross across {rows.length} employees · pays 30 Jun</div>
            </div>
            <Badge tone="amber">{run ? "Processing" : "Draft"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
            {[["Net pay", "$" + Math.round(total * 0.82).toLocaleString()], ["Taxes (PAYE)", "$" + Math.round(total * 0.13).toLocaleString()], ["Pension", "$" + Math.round(total * 0.05).toLocaleString()]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>{v}</div></div>
            ))}
            <div style={{ marginLeft: "auto", alignSelf: "center" }}>
              <Button variant="accent" icon={run ? "loader-2" : "player-play"} onClick={() => setRun(true)}>{run ? "Running…" : "Run payroll"}</Button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Payroll checklist" />
          {[["Timesheets approved", true], ["Expenses reconciled", true], ["New hires added", true], ["Bonuses applied", false]].map(([l, done], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--neutral-100)" : "none" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "var(--success)" : "var(--bg3)", color: done ? "#fff" : "var(--fg4)", border: done ? "none" : "1px solid var(--border-strong)" }}>
                <Icon name={done ? "check" : "minus"} size={14} /></span>
              <span style={{ fontSize: 13.5, color: done ? "var(--fg2)" : "var(--fg1)", fontWeight: done ? 400 : 600 }}>{l}</span>
              {!done && <span style={{ marginLeft: "auto" }}><a style={linkA}>Complete</a></span>}
            </div>
          ))}
        </Card>
      </div>
      <Card pad={false}>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>Employee breakdown</h3>
          <div style={{ marginLeft: "auto" }}><Button variant="secondary" size="sm" icon="adjustments">Adjust</Button></div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead><tr style={{ background: "var(--bg2)", textAlign: "left", color: "var(--fg3)", fontSize: 12 }}>
            {["Employee", "Department", "Gross", "Net", "Status"].map((h, i) =>
              <th key={i} style={{ padding: "11px 18px", fontWeight: 600, borderBottom: "1px solid var(--border)", textAlign: i >= 2 && i <= 3 ? "right" : "left" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--neutral-100)" }}>
                <td style={{ padding: "12px 18px" }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <Avatar src={p.av} size={34} /><span style={{ fontWeight: 600, color: "var(--fg1)" }}>{p.name}</span></div></td>
                <td style={{ padding: "12px 18px", color: "var(--fg2)" }}>{p.dept}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--fg1)" }}>${p.gross.toLocaleString()}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--fg2)" }}>${Math.round(p.gross * 0.82).toLocaleString()}</td>
                <td style={{ padding: "12px 18px" }}><Badge tone={p.status === "Ready" ? "success" : "warning"} dot>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("amani@andikisha.co");
  const [pw, setPw] = useState("password");
  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "var(--font-sans)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg2)" }}>
        <form onSubmit={e => { e.preventDefault(); onLogin(); }} style={{ width: 360 }}>
          <img src="../../assets/brand/andikisha-full.svg" style={{ height: 30, marginBottom: 34 }} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--fg1)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "var(--fg3)", margin: "0 0 26px" }}>Sign in to your Andikisha workspace.</p>
          <label style={lbl}>Work email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box", marginBottom: 16, padding: "11px 12px" }} />
          <label style={lbl}>Password</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box", marginBottom: 10, padding: "11px 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--fg2)" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--green-700)" }} /> Remember me</label>
            <a style={linkA}>Forgot password?</a>
          </div>
          <Button variant="primary" size="lg" full type="submit">Sign in</Button>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--fg3)", marginTop: 18 }}>
            New here? <a style={linkA}>Request access</a></div>
        </form>
      </div>
      <div style={{ flex: 1, background: "linear-gradient(150deg, var(--green-900), var(--green-700))", color: "#fff",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: 64, position: "relative", overflow: "hidden" }}>
        <img src="../../assets/brand/andikisha-mark-white.svg" style={{ width: 54, height: 54, marginBottom: 28, opacity: 0.95 }} />
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, maxWidth: 420 }}>People, paid on time.</div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", marginTop: 16, maxWidth: 400, lineHeight: 1.6 }}>
          Onboard, pay and support your whole team from one calm, capable workspace.</p>
        <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
          {[["1,848", "Employees"], ["$2.4M", "Monthly payroll"], ["99.9%", "On-time pay"]].map(([n, l]) => (
            <div key={l}><div style={{ fontSize: 24, fontWeight: 700, color: "var(--amber-400)" }}>{n}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>{l}</div></div>
          ))}
        </div>
        <img src="../../assets/brand/andikisha-mark-white.svg" aria-hidden="true" style={{ position: "absolute", right: -50, bottom: -55, width: 260, height: 260, opacity: 0.1, pointerEvents: "none" }} />
      </div>
    </div>
  );
}
const lbl = { display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg2)", marginBottom: 6 };

Object.assign(window, { Leave, Payroll, Login });
