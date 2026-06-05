// Andikisha App UI kit — data + Dashboard, Employees screens
const TEAM = [
  { name: "Amani Okello", role: "Engineering Lead", dept: "Engineering", email: "amani@andikisha.co", av: AV(1), status: "Active", type: "Full-time", loc: "Nairobi" },
  { name: "Kesi Mwangi", role: "People Partner", dept: "People Ops", email: "kesi@andikisha.co", av: AV(6), status: "Active", type: "Full-time", loc: "Nairobi" },
  { name: "Dalia Hassan", role: "Finance Manager", dept: "Finance", email: "dalia@andikisha.co", av: AV(8), status: "On leave", type: "Full-time", loc: "Mombasa" },
  { name: "Tomas Werner", role: "Backend Engineer", dept: "Engineering", email: "tomas@andikisha.co", av: AV(4), status: "Active", type: "Contract", loc: "Remote" },
  { name: "Priya Nair", role: "Product Designer", dept: "Design", email: "priya@andikisha.co", av: AV(2), status: "Active", type: "Full-time", loc: "Remote" },
  { name: "Joseph Kim", role: "Recruiter", dept: "People Ops", email: "joseph@andikisha.co", av: AV(7), status: "Invited", type: "Full-time", loc: "Nairobi" },
  { name: "Lena Costa", role: "Marketing Lead", dept: "Marketing", email: "lena@andikisha.co", av: AV(3), status: "Active", type: "Full-time", loc: "Lisbon" },
  { name: "Sam Ndlovu", role: "Support Specialist", dept: "Support", email: "sam@andikisha.co", av: AV(5), status: "Active", type: "Part-time", loc: "Remote" },
];
const statusTone = { "Active": "success", "On leave": "warning", "Invited": "neutral", "Offboarded": "danger" };

function PageWrap({ children }) {
  return <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>;
}

function Dashboard() {
  return (
    <PageWrap>
      {/* welcome banner */}
      <div style={{ background: "linear-gradient(100deg, var(--green-900), var(--green-700))", borderRadius: 14,
        padding: "22px 26px", color: "#fff", display: "flex", alignItems: "center", gap: 20, overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Good morning, Amani 👋</div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            You have <b style={{ color: "var(--amber-400)" }}>6 leave requests</b> and <b style={{ color: "var(--amber-400)" }}>payroll for June</b> to review today.</div>
        </div>
        <Button variant="accent" icon="report-money">Review payroll</Button>
        <div style={{ position: "absolute", right: -30, top: -40, width: 180, height: 180, borderRadius: "50%",
          background: "rgba(232,160,32,0.12)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Stat icon="users-group" label="Total employees" value="1,848" sub="Headcount overview" delta="+18%" up />
        <Stat icon="user-plus" tone="ink" label="New joinees" value="32" sub="This month" delta="+22%" up />
        <Stat icon="clock-x" tone="amber" label="Late arrivals" value="12" sub="Delayed logins today" delta="−16%" />
        <Stat icon="report-money" label="Payroll cost" value="$2.4M" sub="June outflow" delta="+4%" up />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card>
          <CardHead title="Attendance trend" action={<Button variant="secondary" size="sm" iconRight="chevron-down">Weekly</Button>} />
          <div style={{ display: "flex", gap: 22, marginBottom: 14 }}>
            {[["82", "On-time"], ["11", "Late"], ["6", "Absent"]].map(([n, l]) => (
              <div key={l} style={{ borderRight: "1px solid var(--border)", paddingRight: 22 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "var(--fg1)" }}>{n}</span>
                <span style={{ fontSize: 13, color: "var(--fg3)", marginLeft: 7 }}>{l}</span>
              </div>
            ))}
          </div>
          <BarChart colors={["var(--green-700)", "var(--amber-500)", "var(--neutral-200)"]}
            data={[[42,7,3],[38,9,4],[45,5,2],[40,11,5],[48,6,2],[30,4,8],[22,3,9]]} />
          <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 12.5, color: "var(--fg2)" }}>
            <Legend c="var(--green-700)" l="Present" /><Legend c="var(--amber-500)" l="Late" /><Legend c="var(--neutral-300)" l="Absent" />
          </div>
        </Card>

        <Card pad={false}>
          <div style={{ padding: 18, paddingBottom: 6 }}><CardHead title="Who's in today" action={<a style={linkA}>View all</a>} /></div>
          <div style={{ padding: "0 18px 8px" }}>
            {TEAM.slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0",
                borderBottom: i < 4 ? "1px solid var(--neutral-100)" : "none" }}>
                <Avatar src={p.av} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg3)" }}>{p.dept}</div>
                </div>
                <span style={{ marginLeft: "auto" }}>
                  {p.status === "On leave" ? <Badge tone="warning">On leave</Badge>
                    : i === 3 ? <Badge tone="neutral" dot>Remote</Badge> : <Badge tone="success" dot>Clocked in</Badge>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHead title="Leave by department" />
          {[["Engineering", 72, "var(--green-700)"], ["People Ops", 54, "var(--amber-500)"], ["Design", 38, "var(--green-500)"], ["Finance", 24, "var(--neutral-400)"]].map(([d, v, c]) => (
            <div key={d} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ color: "var(--fg2)" }}>{d}</span><span style={{ fontWeight: 600, color: "var(--fg1)" }}>{v}%</span>
              </div>
              <div style={{ height: 8, background: "var(--bg3)", borderRadius: 999 }}>
                <div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="Pending approvals" action={<Badge tone="amber">6 new</Badge>} />
          {[["Kesi Mwangi", "Annual leave · 3 days", "leave"], ["Tomas Werner", "Expense · $340", "money"], ["Priya Nair", "Remote work · 1 wk", "leave"]].map(([n, d, t], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--neutral-100)" : "none" }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: t === "money" ? "var(--amber-50)" : "var(--green-50)",
                color: t === "money" ? "var(--amber-700)" : "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name={t === "money" ? "receipt" : "plane-departure"} size={18} /></span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)" }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--fg3)" }}>{d}</div></div>
              <button style={ghostIcon("var(--success)")}><Icon name="check" size={16} /></button>
              <button style={ghostIcon("var(--danger)")}><Icon name="x" size={16} /></button>
            </div>
          ))}
        </Card>
      </div>
    </PageWrap>
  );
}
const Legend = ({ c, l }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
  <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span>;
const linkA = { fontSize: 13, fontWeight: 600, color: "var(--green-700)", cursor: "pointer" };
const ghostIcon = (c) => ({ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "#fff",
  color: c, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" });

function Employees() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All departments");
  const depts = ["All departments", ...Array.from(new Set(TEAM.map(t => t.dept)))];
  const rows = TEAM.filter(t => (dept === "All departments" || t.dept === dept) &&
    (t.name.toLowerCase().includes(q.toLowerCase()) || t.role.toLowerCase().includes(q.toLowerCase())));
  return (
    <PageWrap>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <Stat icon="users-group" label="Total" value="1,848" sub="Active employees" />
        <Stat icon="user-check" tone="ink" label="Full-time" value="1,602" sub="86% of team" />
        <Stat icon="briefcase" tone="amber" label="Contract" value="184" sub="10% of team" />
        <Stat icon="user-plus" label="Open roles" value="14" sub="Across 5 teams" />
      </div>
      <Card pad={false}>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--neutral-100)" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>All employees</h3>
          <Badge tone="green">{rows.length} shown</Badge>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={16} style={{ position: "absolute", left: 11, top: 10, color: "var(--fg3)" }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people…"
                style={{ ...inp, paddingLeft: 34, width: 200 }} />
            </div>
            <select value={dept} onChange={e => setDept(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
            <Button variant="secondary" size="md" icon="filter">Filters</Button>
            <Button variant="primary" size="md" icon="plus">Add</Button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--bg2)", textAlign: "left", color: "var(--fg3)", fontSize: 12 }}>
              {["Employee", "Department", "Type", "Location", "Status", ""].map((h, i) => (
                <th key={i} style={{ padding: "11px 18px", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--neutral-100)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <td style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Avatar src={p.av} size={38} />
                    <div><div style={{ fontWeight: 600, color: "var(--fg1)" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--fg3)" }}>{p.email}</div></div>
                  </div>
                </td>
                <td style={{ padding: "12px 18px", color: "var(--fg2)" }}>{p.dept}<div style={{ fontSize: 12, color: "var(--fg3)" }}>{p.role}</div></td>
                <td style={{ padding: "12px 18px" }}><Badge tone={p.type === "Contract" ? "amber" : "neutral"}>{p.type}</Badge></td>
                <td style={{ padding: "12px 18px", color: "var(--fg2)" }}>{p.loc}</td>
                <td style={{ padding: "12px 18px" }}><Badge tone={statusTone[p.status]} dot>{p.status}</Badge></td>
                <td style={{ padding: "12px 18px", textAlign: "right" }}><button style={ghostIcon("var(--fg3)")}><Icon name="dots" size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}
const inp = { fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--fg1)", padding: "8px 12px",
  border: "1px solid var(--border-strong)", borderRadius: 8, background: "#fff", outline: "none" };

Object.assign(window, { Dashboard, Employees, PageWrap, TEAM, statusTone, inp, linkA, ghostIcon, Legend });
