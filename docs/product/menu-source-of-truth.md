# Menu Source of Truth

## Purpose

This document is the canonical input for every prompt, skill, and engineering decision that touches menus, route guards, conditional UI sections, or tier-gated features in AndikishaHR. Prompts A.5, A.6, and B2 reference it. Future prompts that affect navigation or access control should reference it too.

The actual menu inventory lives in `andikishahr-portal-menus.md`, alongside this document. This document is not a duplicate; it is the contract that says how the menu inventory becomes code.

## The rule

When any prompt or skill needs to know:

- Which menu items exist in which portal
- Which roles see which items
- Which items are conditional (render only when a specific role is in the user's set)
- Which items are tier-gated (visible only on certain subscription tiers)
- Which items are Phase 3 placeholders (hidden behind feature flags)
- The exact route paths for each menu item

The answer is in `andikishahr-portal-menus.md`. Read it before generating any navigation config, route guard, or conditional rendering logic.

## How the menu inventory becomes code

The menu doc translates into three concrete artifacts.

### Artifact 1: navigation config files

Each portal has a navigation config that drives the chrome (sidebar items in tenant-portal, horizontal nav items in platform-portal):

- `frontend/tenant-portal/src/lib/navConfig.ts` exports `tenantNavConfig` consumed by `EmployeeShell` and `TenantAdminShell`
- `frontend/platform-portal/src/lib/navConfig.ts` exports `platformNavConfig` consumed by `SuperAdminShell`

Each nav config is a typed structure: an array of `NavItem` objects, where each item has a label, route, Lucide icon, optional sub-items, optional visibility rule (role set, tier requirement, feature flag), and optional badge.

```typescript
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
  // Visibility rules (all optional, all combined with AND semantics):
  visibleForRoles?: Role[];           // visible if user has any of these roles
  visibleForTiers?: TenantTier[];     // visible if tenant is on one of these tiers
  visibleWhenFlag?: FeatureFlag;      // visible if this feature flag is enabled
  // Conditional rendering:
  renderOnlyIfRolePresent?: Role;     // for sections like "My Team" that appear only when LINE_MANAGER is in the role set
};
```

The config is the single source of truth. The chrome components render based on this config. The route guards check against this config. Custom role permission overrides also resolve against this config (a custom role inheriting from HR_MANAGER sees HR_MANAGER's menu items by default).

### Artifact 2: route guards

The middleware in each portal enforces admission at the route level. The guards are derived from the same nav config, so a menu item that's hidden for a role is also blocked at the URL level for that role.

```typescript
// frontend/tenant-portal/src/middleware.ts (sketch)
const isAllowed = (path: string, user: CurrentUser): boolean => {
  const navItem = findNavItemByPath(tenantNavConfig, path);
  if (!navItem) return true;  // unguarded paths default to allowed
  return checkVisibility(navItem, user);
};
```

This means: the menu doc drives the menu doc drives the menu doc. One source of truth, three consumers (UI rendering, route guards, permission resolution).

### Artifact 3: chrome component contracts

The chrome shells in `@andikisha/ui` (`EmployeeShell`, `TenantAdminShell`, `SuperAdminShell`, `SidebarShell`, `TopBar`, `NavRail`) accept the nav config as a prop. They render hierarchical items, conditional items, and tier-gated items based on the config and the current user from `useCurrentUser`.

The library must support every pattern the nav config can express. If the menu doc requires hierarchical sub-items, the SidebarShell renders them. If it requires conditional rendering based on a role being present, the shell supports it. If it requires tier gating, the shell supports it.

## Patterns the menu doc requires

Reading `andikishahr-portal-menus.md` surfaces these patterns. The shared library must support all of them.

### Pattern 1: hierarchical menu items

The Settings section in tenant-portal has sub-items (Organisation, Users and Roles, Departments and Locations, Leave Policies, etc.). The SidebarShell renders these as a collapsible parent with children. Each child has its own visibility rule.

### Pattern 2: role-based visibility per menu item

The `/admin/*` menu items have visibility tags. `Payroll` is visible to ADMIN and PAYROLL_OFFICER. `Documents` is visible to ADMIN, HR_MANAGER, and HR. The same nav config is consumed by all admin-side users; the chrome filters based on the user's role set.

### Pattern 3: conditional sections (My Team)

The My Team section in `/my/*` renders only when the user holds LINE_MANAGER. Other employees never see it. This is `renderOnlyIfRolePresent: 'LINE_MANAGER'` in the nav config. The shell respects the rule.

### Pattern 4: tier-gated items

Custom Roles management (under Settings > Users and Roles) is visible only for tenants on Professional tier or above. This is `visibleForTiers: ['PROFESSIONAL', 'ENTERPRISE']`. Starter tenants don't see the option.

### Pattern 5: Phase 3 placeholders

Performance and Assets in `/admin/*` are documented as Phase 3 features hidden behind feature flags. The nav config has `visibleWhenFlag: 'performance_enabled'` and `visibleWhenFlag: 'assets_enabled'` for these items. The flags are false in MVP; they flip true when the services ship.

### Pattern 6: read-only access

HR sees Employees as read-only (no create, edit, or delete buttons). This is permission-level, not menu-level. The menu item is visible; the actions within it are gated by `useHasPermission('employees.update')` or similar checks at the component level. The nav config doesn't model this; the permissions engine does.

## How prompts consume this

Each prompt that touches menus or guards reads this document and `andikishahr-portal-menus.md` together.

### Prompt A.6 (@andikisha/ui audit and refinement)

Reads this document in Phase 0 to verify the library supports every pattern listed above. Specifically:

- SidebarShell renders hierarchical items with sub-items (Pattern 1)
- TopBar and chrome filter items based on the current user's role set (Pattern 2)
- Shells support conditional rendering based on role presence (Pattern 3)
- A tier-aware gating mechanism exists or gets built (Pattern 4)
- A feature flag mechanism exists or gets built (Pattern 5)
- The permissions engine supports component-level checks via `useHasPermission` (Pattern 6) — this is a B2 concern but the hook signature should be reserved in A.6

If any pattern isn't supported, A.6's refinement step adds it. The library must be capable of expressing the full menu doc before A.5 or B2 begins.

### Prompt A.5 (scaffold platform-portal)

Reads this document and the menu doc to build `platformNavConfig`. Each top-level item in the platform-portal section of the menu doc becomes a `NavItem` with the appropriate icon, route, and visibility rule (all platform-portal items are `visibleForRoles: ['SUPER_ADMIN']`).

The horizontal layout uses the same NavItem shape but renders differently. The shell supports both layouts via composition.

### Prompt B2 (permissions engine, custom roles, middleware fix)

Reads this document to build the tenant-portal middleware (real role-aware version replacing the permissive TODO from Prompt A). The middleware reads `tenantNavConfig` to determine which routes are allowed for which role sets, instead of hardcoding the rules in the middleware itself.

Also reads this document to build the custom role management UI. Custom role inheritance from a system role means the custom role inherits the system role's nav visibility by default, with the option to add or remove menu items if extended permission rules dictate.

## When the menu doc changes

If `andikishahr-portal-menus.md` gets updated (new menu item, changed visibility rule, new tier gate), three things follow:

1. The relevant `navConfig.ts` files update
2. The middleware automatically respects the change because it reads the config
3. Any new pattern not yet supported by the library gets surfaced as a follow-up

The menu doc is the high-level spec. The nav config is the runtime instantiation. The library and middleware consume the nav config. None of these three layers should drift; they all derive from the menu doc.

## What this is not

This document is not the menu inventory itself. The inventory is in `andikishahr-portal-menus.md`. This document is the contract between the inventory and the code.

This document is not a place to add new menu items or change visibility rules. Those changes go in the menu doc. This document describes the mechanism by which any menu doc translates to working code.

This document is not a substitute for the permissions engine. The engine resolves role-to-permission mappings at runtime. This document describes how the menu structure expresses those resolutions visually.

## Companion documents

- `andikishahr-portal-menus.md` — the canonical menu inventory (what items exist, who sees them)
- `.claude/skills/template-reference/SKILL.md` — the SmartHR template rules (visual reference only)
- `.claude/skills/template-reference/screen-mapping.md` — which SmartHR screens reference which AndikishaHR features
- `docs/design/system/template-usage.md` — long-form template policy
- `docs/decisions/0001-single-tenant-portal.md` — frontend consolidation decision
- `docs/decisions/0002-platform-portal-separation.md` — platform-portal separation decision
- `docs/adr/0003-multi-role-foundation.md` — multi-role architecture decision
- `docs/adr/0004-permissions-engine-and-custom-roles.md` — permissions engine decision

## Maintenance

Update this document when:

- A new pattern emerges that the menu doc requires but isn't listed above (Pattern 7, etc.)
- The `NavItem` shape changes
- The relationship between the menu doc and the nav config files changes
- A new portal is added (currently three: tenant, platform, landing; landing has no nav config because it's a marketing site)

Treat this document as living. Update it alongside the menu doc when the contract evolves.

---

*Created May 2026 to ground the multi-role and portal consolidation work. Referenced by Prompts A.5, A.6, and B2.*
