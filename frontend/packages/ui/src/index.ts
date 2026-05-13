// ── Utilities ──────────────────────────────────────────────────────────────
export { cn } from "./utils";
export { formatMoney } from "./lib/formatMoney";
export { formatDate, formatTime } from "./lib/formatDate";

// ── Brand ──────────────────────────────────────────────────────────────────
export { LogoFull } from "./components/LogoFull";
export { Logomark } from "./components/Logomark";

// ── Primitives — Buttons ───────────────────────────────────────────────────
export { Button } from "./components/button";
export type { ButtonVariant, ButtonSize } from "./components/button";

// ── Primitives — Display ───────────────────────────────────────────────────
export { Badge } from "./components/Badge";
export type { BadgeStatus } from "./components/Badge";
export { Avatar } from "./components/Avatar";
export { Tag, tagColorFor } from "./components/Tag";
export type { TagColor } from "./components/Tag";
export { Eyebrow } from "./components/Eyebrow";
export { KbdHint } from "./components/KbdHint";
export { EmptyState } from "./components/EmptyState";
export { MoneyAmount } from "./components/MoneyAmount";

// ── Data primitives ────────────────────────────────────────────────────────
export { StatCard } from "./components/StatCard";
export { KpiGroup } from "./components/KpiGroup";
export { DataTable } from "./components/DataTable";

// ── Primitives — Form ─────────────────────────────────────────────────────
export { Input } from "./components/Input";
export { Textarea } from "./components/Textarea";
export { Select } from "./components/Select";
export { Checkbox } from "./components/Checkbox";
export { Switch } from "./components/Switch";
export { FormField } from "./components/FormField";

// ── Primitives — Loading ──────────────────────────────────────────────────
export { Skeleton, SkeletonText } from "./components/Skeleton";
export { Spinner } from "./components/Spinner";

// ── Command palette ───────────────────────────────────────────────────────
export { CommandPalette } from "./components/CommandPalette";
export type { CommandGroup, CommandItem, CommandPaletteProps } from "./components/CommandPalette";

// ── Primitives — Overlays ─────────────────────────────────────────────────
export { Tooltip } from "./components/Tooltip";
export {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "./components/Dropdown";
export { DialogRoot, DialogTrigger, DialogClose, DialogContent } from "./components/Dialog";
export { SheetRoot, SheetTrigger, SheetClose, SheetContent } from "./components/Sheet";

// ── Primitives — Feedback ─────────────────────────────────────────────────
export { InlineAlert } from "./components/InlineAlert";

// ── Role & Permission ──────────────────────────────────────────────────────
export { useCurrentRole, RoleContext } from "./lib/useCurrentRole";
export type { UserRole } from "./lib/useCurrentRole";
export { PermissionGate } from "./components/PermissionGate";
export { RoleBadge } from "./components/RoleBadge";

// ── Offline ────────────────────────────────────────────────────────────────
export { useOnlineStatus } from "./lib/useOnlineStatus";
export { OfflineBadge } from "./components/OfflineBadge";

// ── Navigation & Shells (Plan B) ──────────────────────────────────────────
export { TopBar } from "./components/TopBar";
export { NavRail, NavRailItem, NavRailGroup } from "./components/NavRail";
export type { BottomNavItem } from "./components/EmployeeShell";
export { ProfileMenu } from "./components/ProfileMenu";
export { SuperAdminShell } from "./components/SuperAdminShell";
export { TenantAdminShell } from "./components/TenantAdminShell";
export { EmployeeShell } from "./components/EmployeeShell";

// ── Legacy — in use by all three portals, replaced in Plan B ───────────────
export { BaseModal } from "./components/BaseModal";
export { ToastProvider, useToast } from "./components/Toaster";
export { PageHeader } from "./components/PageHeader";
export { QueryProvider } from "./components/QueryProvider";
export { SidebarShell } from "./components/SidebarShell";
export type { NavItem, NavSection } from "./components/SidebarShell";
