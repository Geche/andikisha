// Andikisha App UI kit — root
const TITLES = {
  dashboard: ["Dashboard", "Overview"], employees: ["Employees", "People"],
  attendance: ["Attendance", "Time"], leave: ["Leave", "Time off"], payroll: ["Payroll", "Pay"],
  recruitment: ["Recruitment", "Hiring"], performance: ["Performance", "Reviews"],
  expenses: ["Expenses", "Spend"], reports: ["Reports", "Analytics"], settings: ["Settings", "Workspace"],
};

function Placeholder({ id }) {
  return (
    <PageWrap>
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px", textAlign: "center" }}>
          <span style={{ width: 64, height: 64, borderRadius: 16, background: "var(--green-50)", color: "var(--green-700)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Icon name={(NAV.find(n => n.id === id) || {}).icon || "layout-grid"} size={30} /></span>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--fg1)" }}>{TITLES[id][0]}</h2>
          <p style={{ fontSize: 14, color: "var(--fg3)", maxWidth: 380, marginTop: 8, lineHeight: 1.6 }}>
            This surface isn't part of the kit yet. The four built-out flows are
            <b style={{ color: "var(--fg2)" }}> Dashboard, Employees, Leave</b> and <b style={{ color: "var(--fg2)" }}>Payroll</b>.</p>
          <div style={{ marginTop: 20 }}><Button variant="secondary" icon="arrow-left" onClick={() => window.__nav("dashboard")}>Back to dashboard</Button></div>
        </div>
      </Card>
    </PageWrap>
  );
}

function App() {
  const [authed, setAuthed] = useState(false);
  const [active, setActive] = useState("dashboard");
  window.__nav = setActive;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  const screen = { dashboard: <Dashboard />, employees: <Employees />, leave: <Leave />, payroll: <Payroll /> }[active]
    || <Placeholder id={active} />;
  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Sidebar active={active} onNav={setActive} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg2)" }}>
        <Topbar title={TITLES[active][0]} crumb={TITLES[active][1]} onLogout={() => setAuthed(false)} />
        <div style={{ flex: 1, overflowY: "auto" }}>{screen}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
