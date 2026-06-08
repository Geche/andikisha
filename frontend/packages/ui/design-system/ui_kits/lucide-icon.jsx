// Shared Lucide icon component for Andikisha UI kits.
// Builds an <svg> directly from Lucide's icon-node data (window.lucide.icons),
// so it's pure-render and safe under React re-renders (no global createIcons scan).
// Accepts the design system's Tabler-style names and maps them to Lucide.
const ICON_MAP = {
  "layout-dashboard": "LayoutDashboard", "users-group": "Users", "calendar-clock": "CalendarClock",
  "plane-departure": "PlaneTakeoff", "report-money": "Banknote", "user-search": "UserSearch",
  "target-arrow": "Target", "receipt": "Receipt", "chart-histogram": "ChartColumn", "settings": "Settings",
  "search": "Search", "dots-vertical": "EllipsisVertical", "dots": "Ellipsis", "home": "House",
  "calendar-due": "CalendarClock", "plus": "Plus", "bell": "Bell", "logout": "LogOut",
  "chevron-down": "ChevronDown", "arrow-up-right": "ArrowUpRight", "arrow-down-right": "ArrowDownRight",
  "arrow-right": "ArrowRight", "arrow-left": "ArrowLeft", "user-plus": "UserPlus", "clock-x": "ClockAlert",
  "user-check": "UserCheck", "briefcase": "Briefcase", "filter": "Filter", "check": "Check", "x": "X",
  "beach": "Umbrella", "calendar-check": "CalendarCheck", "sum": "Sigma", "player-play": "Play",
  "loader-2": "LoaderCircle", "minus": "Minus", "adjustments": "SlidersHorizontal", "mail": "Mail",
  "trash": "Trash2", "download": "Download", "circle-check": "CircleCheck", "circle-check-filled": "CircleCheck",
  "tag": "Tag", "map-pin": "MapPin", "shield-check": "ShieldCheck", "building-bank": "Landmark",
  "plant-2": "Sprout", "rocket": "Rocket", "world": "Globe", "bolt": "Zap", "leaf": "Leaf", "quote": "Quote",
  "layout-grid": "LayoutGrid",
  // Lucide ships no brand logos — substitute generic comms glyphs for socials:
  "brand-x": "Send", "brand-linkedin": "AtSign", "brand-github": "Rss",
};
function _pascal(k) { return k.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(""); }

function LucideIcon({ name, size = 18, color, className = "", style = {}, strokeWidth = 2 }) {
  const L = window.lucide;
  const pascal = ICON_MAP[name] || _pascal(name);
  const raw = L && L.icons && L.icons[pascal];
  if (!raw) return <span style={{ display: "inline-block", width: size, height: size, flex: "none", ...style }} />;
  // Icon-node shape varies by Lucide version: either ["svg", attrs, children]
  // or just the children array [["path", {...}], ...]. Normalise to children.
  const children = (Array.isArray(raw) && raw[0] === "svg") ? (raw[2] || []) : raw;
  const inner = children.map(([tag, attrs]) =>
    "<" + tag + " " + Object.entries(attrs).map(([k, v]) => k + '="' + v + '"').join(" ") + "></" + tag + ">"
  ).join("");
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={("lucide " + className).trim()} style={{ color, flex: "none", ...style }}
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
Object.assign(window, { LucideIcon, ICON_MAP });

// ---- Tabler alternate set (self-hosted webfont) ----
// Usage: <TablerIcon name="users-group" size={18} />  (raw Tabler names)
function TablerIcon({ name, size = 18, color, className = "", style = {} }) {
  return <i className={("ti ti-" + name + " " + className).trim()}
    style={{ fontSize: size, lineHeight: 1, color, ...style }} />;
}
window.TablerIcon = TablerIcon;
