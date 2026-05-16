# UI System — Plan A: Sprint 1 Primitives + /preview Route

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the skeleton `@andikisha/ui` package with a complete, brand-correct primitive library consumed by all three portals, verified on a `/preview` route.

**Architecture:** All primitives live in `frontend/packages/ui/src/`. Admin-portal and employee-portal use Tailwind v4 (`@import "tailwindcss"` + `@theme {}`); superadmin-portal uses Tailwind v3 (`tailwind.config.ts`). All three already have matching brand tokens, so component classes use token names (`brand-900`, `amber`, `surface-alt`, `near-black`, `error`) not raw hex values. Components export from a single `src/index.ts` public API.

**Tech Stack:** React 19, Next.js 15 App Router, Tailwind v4/v3, Radix UI (dialog, dropdown-menu, select, tooltip, checkbox), clsx + tailwind-merge, Lucide React (peer dep).

**Confirmed decisions:**
- superadmin-portal and admin-portal remain separate Next.js apps
- /preview route in admin-portal for component review
- Brand primary button = `bg-brand-900` (form submits, nav actions); CTA button = `bg-amber text-near-black` (dashboard top-level actions like "New Tenant", "Run Payroll")
- No purple anywhere. No `bg-blue-*` anywhere.
- Focus ring: `outline outline-2 outline-amber outline-offset-2` via `focus-visible:`
- Canvas: `bg-surface-alt` (`#F8F7F4`). Cards: `bg-surface border border-[#E5E7EB] rounded-xl`. No shadows on cards.
- Tabular figures: `font-mono` / `font-variant-numeric: tabular-nums` on all KES amounts and numeric table cells.

---

## Existing inventory (keep, do not delete)

| File | Status | Action |
|---|---|---|
| `src/utils.ts` | ✅ cn() correct | Keep as-is |
| `src/components/LogoFull.tsx` | ✅ correct | Keep as-is |
| `src/components/Logomark.tsx` | ✅ correct | Keep as-is |
| `src/components/SidebarShell.tsx` | ✅ in use all 3 portals | Keep as-is (replaced in Plan B) |
| `src/components/PageHeader.tsx` | ✅ in use all 3 portals | Keep as-is |
| `src/components/QueryProvider.tsx` | ✅ correct | Keep as-is |
| `src/components/button.tsx` | ❌ uses `bg-blue-600` | Replace in Task 1 |
| `src/components/BaseModal.tsx` | ⚠️ custom, no Radix | Keep for now, Dialog in Task 8 replaces it |
| `src/components/Toaster.tsx` | ⚠️ check exports | Keep, update in Task 10 |

---

## File map — what gets created

```
frontend/packages/ui/src/
  components/
    Button.tsx          ← Task 1 (replaces button.tsx)
    Badge.tsx           ← Task 2
    Avatar.tsx          ← Task 3
    Tag.tsx             ← Task 4
    Input.tsx           ← Task 5
    Textarea.tsx        ← Task 5
    Select.tsx          ← Task 6
    Checkbox.tsx        ← Task 6
    Switch.tsx          ← Task 6
    Skeleton.tsx        ← Task 7
    Spinner.tsx         ← Task 7
    Eyebrow.tsx         ← Task 8
    KbdHint.tsx         ← Task 8
    EmptyState.tsx      ← Task 8
    Tooltip.tsx         ← Task 9
    Dropdown.tsx        ← Task 9
    Dialog.tsx          ← Task 10
    Sheet.tsx           ← Task 10
    InlineAlert.tsx     ← Task 11
    MoneyAmount.tsx     ← Task 12
    FormField.tsx       ← Task 12
    PermissionGate.tsx  ← Task 13
    RoleBadge.tsx       ← Task 13
    OfflineBadge.tsx    ← Task 14
  lib/
    useCurrentRole.ts   ← Task 13
    useOnlineStatus.ts  ← Task 14
  index.ts              ← Task 15 (updated exports)

frontend/admin-portal/src/app/
  preview/
    page.tsx            ← Task 16
    layout.tsx          ← Task 16
```

---

### Task 1: Replace Button with brand-correct variants

**Files:**
- Create: `frontend/packages/ui/src/components/Button.tsx`
- Delete: `frontend/packages/ui/src/components/button.tsx` (old file, lowercase)

- [ ] **Step 1: Create Button.tsx**

```tsx
// frontend/packages/ui/src/components/Button.tsx
"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils";

export type ButtonVariant = "primary" | "cta" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   "bg-brand-900 text-white hover:bg-brand-800",
  cta:       "bg-amber text-near-black hover:bg-amber-dark",
  secondary: "bg-surface border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]",
  ghost:     "text-[#374151] hover:bg-[#F3F4F6]",
  danger:    "bg-error text-white hover:bg-red-600",
  outline:   "border border-brand-900 text-brand-900 hover:bg-brand-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-[13.5px]",
  lg: "h-11 px-5 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
```

- [ ] **Step 2: Delete old lowercase button.tsx**

```bash
rm frontend/packages/ui/src/components/button.tsx
```

- [ ] **Step 3: Update components/index.ts to export Button from new file**

Change line `export { Button } from "./button";` to `export { Button } from "./Button";`

- [ ] **Step 4: Verify type-check passes**

```bash
cd frontend/admin-portal && npx tsc --noEmit
cd frontend/superadmin-portal && npx tsc --noEmit
cd frontend/employee-portal && npx tsc --noEmit
```
Expected: zero errors in all three.

- [ ] **Step 5: Commit**
```bash
git add frontend/packages/ui/src/components/Button.tsx frontend/packages/ui/src/components/index.ts
git rm frontend/packages/ui/src/components/button.tsx
git commit -m "feat(ui): Button — brand-correct variants (primary/cta/secondary/ghost/danger/outline)"
```

---

### Task 2: Badge component

**Files:**
- Create: `frontend/packages/ui/src/components/Badge.tsx`

Badges are small inline labels. Three semantic groups:
- **Status** (ACTIVE/PAID/APPROVED = brand green; PENDING/DRAFT = amber; TERMINATED/FAILED/REJECTED = error-red; CANCELLED/INACTIVE = neutral)
- **Role** (ADMIN, HR_MANAGER etc. — neutral blue-tinted)
- **Generic** (caller provides className override)

- [ ] **Step 1: Create Badge.tsx**

```tsx
// frontend/packages/ui/src/components/Badge.tsx
import { cn } from "../utils";

export type BadgeStatus =
  | "active" | "approved" | "paid" | "disbursed" | "filed"
  | "pending" | "draft" | "calculating" | "trial"
  | "rejected" | "failed" | "cancelled" | "terminated" | "suspended"
  | "inactive";

const STATUS_CLASSES: Record<BadgeStatus, string> = {
  active:      "bg-brand-100 text-brand-800",
  approved:    "bg-brand-100 text-brand-800",
  paid:        "bg-brand-100 text-brand-800",
  disbursed:   "bg-brand-100 text-brand-800",
  filed:       "bg-brand-100 text-brand-800",
  pending:     "bg-amber-light text-[#92600A]",
  draft:       "bg-[#F3F4F6] text-[#4B5563]",
  calculating: "bg-amber-light text-[#92600A]",
  trial:       "bg-amber-light text-[#92600A]",
  rejected:    "bg-red-100 text-red-700",
  failed:      "bg-red-100 text-red-700",
  cancelled:   "bg-[#F3F4F6] text-[#6B7280]",
  terminated:  "bg-[#F3F4F6] text-[#6B7280]",
  suspended:   "bg-[#F3F4F6] text-[#6B7280]",
  inactive:    "bg-[#F3F4F6] text-[#6B7280]",
};

interface BadgeProps {
  status?: BadgeStatus;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ status, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        status ? STATUS_CLASSES[status] : "bg-[#F3F4F6] text-[#374151]",
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Add export to components/index.ts**

Add line: `export { Badge } from "./Badge";`
Add line: `export type { BadgeStatus } from "./Badge";`

- [ ] **Step 3: Commit**
```bash
git add frontend/packages/ui/src/components/Badge.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Badge — status/neutral variants with brand tokens"
```

---

### Task 3: Avatar component

**Files:**
- Create: `frontend/packages/ui/src/components/Avatar.tsx`

- [ ] **Step 1: Create Avatar.tsx**

```tsx
// frontend/packages/ui/src/components/Avatar.tsx
import { cn } from "../utils";

interface AvatarProps {
  name?: string;        // Used to generate initials
  src?: string;         // Image URL — shows initials when undefined/null
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const SIZE: Record<string, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-14 h-14 text-[18px]",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const base = cn(
    "rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden",
    SIZE[size],
    className
  );
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name ?? ""} className={cn(base, "object-cover")} />
    );
  }
  return (
    <div className={cn(base, "bg-brand-900 text-white")}>
      {initials(name)}
    </div>
  );
}
```

- [ ] **Step 2: Export from index.ts**

Add: `export { Avatar } from "./Avatar";`

- [ ] **Step 3: Commit**
```bash
git add frontend/packages/ui/src/components/Avatar.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Avatar — initials fallback, image slot, 4 sizes"
```

---

### Task 4: Tag — pastel category swatches

**Files:**
- Create: `frontend/packages/ui/src/components/Tag.tsx`

Tags are the pastel taxonomy labels from the sample SVG. They mark department, category, leave type — any stable classification. They are calm, not status-bearing.

- [ ] **Step 1: Create Tag.tsx**

```tsx
// frontend/packages/ui/src/components/Tag.tsx
import { cn } from "../utils";

export type TagColor = "sage" | "sand" | "terracotta" | "rose" | "mauve" | "stone" | "sky" | "default";

const COLOR_CLASSES: Record<TagColor, string> = {
  sage:       "bg-[#CFD4C6] text-[#3D4A36]",
  sand:       "bg-[#E5DDCE] text-[#5C4D2E]",
  terracotta: "bg-[#DFC2C0] text-[#6B2E2C]",
  rose:       "bg-[#E3C6D1] text-[#6B2C46]",
  mauve:      "bg-[#D8CDE0] text-[#4A3363]",
  stone:      "bg-[#D5D3CF] text-[#3D3B37]",
  sky:        "bg-[#C6D8E3] text-[#2C4A5C]",
  default:    "bg-[#F3F4F6] text-[#374151]",
};

interface TagProps {
  color?: TagColor;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export function Tag({ color = "default", size = "md", className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[12px]",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Map a stable string to a deterministic TagColor */
export function tagColorFor(value: string): TagColor {
  const COLORS: TagColor[] = ["sage", "sand", "terracotta", "rose", "mauve", "stone", "sky"];
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length]!;
}
```

- [ ] **Step 2: Export from index.ts**

Add: `export { Tag, tagColorFor } from "./Tag";`
Add: `export type { TagColor } from "./Tag";`

- [ ] **Step 3: Commit**
```bash
git add frontend/packages/ui/src/components/Tag.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Tag — pastel category swatch with 7 tones + deterministic colorFor helper"
```

---

### Task 5: Input and Textarea

**Files:**
- Create: `frontend/packages/ui/src/components/Input.tsx`
- Create: `frontend/packages/ui/src/components/Textarea.tsx`

- [ ] **Step 1: Create Input.tsx**

```tsx
// frontend/packages/ui/src/components/Input.tsx
"use client";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const BASE =
  "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black " +
  "placeholder:text-[#9CA3AF] transition-shadow " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-amber focus-visible:outline-offset-0 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        BASE,
        error
          ? "border-error focus-visible:outline-error"
          : "border-[#D0D5DD] focus-visible:border-brand-900",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
```

- [ ] **Step 2: Create Textarea.tsx**

```tsx
// frontend/packages/ui/src/components/Textarea.tsx
"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black resize-none",
        "placeholder:text-[#9CA3AF] transition-shadow",
        "focus:outline-none focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-amber focus-visible:outline-offset-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error
          ? "border-error focus-visible:outline-error"
          : "border-[#D0D5DD] focus-visible:border-brand-900",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
```

- [ ] **Step 3: Export both from index.ts**

Add:
```
export { Input } from "./Input";
export { Textarea } from "./Textarea";
```

- [ ] **Step 4: Commit**
```bash
git add frontend/packages/ui/src/components/Input.tsx frontend/packages/ui/src/components/Textarea.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Input, Textarea — brand-correct focus ring, error state"
```

---

### Task 6: Select, Checkbox, Switch

**Files:**
- Create: `frontend/packages/ui/src/components/Select.tsx`
- Create: `frontend/packages/ui/src/components/Checkbox.tsx`
- Create: `frontend/packages/ui/src/components/Switch.tsx`

Note: `@radix-ui/react-select` and `@radix-ui/react-checkbox` must be in the consuming apps' package.json. Admin-portal already has `@radix-ui/react-select`. The UI package uses them as peer deps.

- [ ] **Step 1: Check @radix-ui/react-checkbox is in admin-portal**

```bash
grep "@radix-ui/react-checkbox" frontend/admin-portal/package.json
```
If missing, add it:
```bash
cd frontend/admin-portal && pnpm add @radix-ui/react-checkbox
cd frontend/employee-portal && pnpm add @radix-ui/react-checkbox @radix-ui/react-select
cd frontend/superadmin-portal && pnpm add @radix-ui/react-checkbox @radix-ui/react-select
```

- [ ] **Step 2: Create Select.tsx — native select (no Radix, works SSR)**

```tsx
// frontend/packages/ui/src/components/Select.tsx
"use client";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black bg-surface",
        "focus:outline-none focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-amber focus-visible:outline-offset-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error ? "border-error" : "border-[#D0D5DD]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
```

- [ ] **Step 3: Create Checkbox.tsx**

```tsx
// frontend/packages/ui/src/components/Checkbox.tsx
"use client";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../utils";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ id, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "w-4 h-4 rounded border border-[#D0D5DD] bg-surface flex items-center justify-center",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
        "data-[state=checked]:bg-brand-900 data-[state=checked]:border-brand-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RadixCheckbox.Indicator>
        <Check size={11} strokeWidth={3} className="text-white" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
```

- [ ] **Step 4: Create Switch.tsx**

```tsx
// frontend/packages/ui/src/components/Switch.tsx
"use client";
import { cn } from "../utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function Switch({ checked, onCheckedChange, disabled, size = "md", className, id }: SwitchProps) {
  const track = size === "sm" ? "w-8 h-4" : "w-10 h-5";
  const thumb = size === "sm"
    ? "w-3 h-3 data-[on=true]:translate-x-4"
    : "w-4 h-4 data-[on=true]:translate-x-5";
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      data-on={checked}
      className={cn(
        "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        track,
        checked ? "bg-brand-900" : "bg-[#D1D5DB]",
        className
      )}
    >
      <span
        data-on={checked}
        className={cn(
          "block bg-white rounded-full shadow-sm transition-transform",
          thumb
        )}
      />
    </button>
  );
}
```

- [ ] **Step 5: Export all three from index.ts**

```
export { Select } from "./Select";
export { Checkbox } from "./Checkbox";
export { Switch } from "./Switch";
```

- [ ] **Step 6: Commit**
```bash
git add frontend/packages/ui/src/components/Select.tsx frontend/packages/ui/src/components/Checkbox.tsx frontend/packages/ui/src/components/Switch.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Select, Checkbox, Switch — brand focus rings, Radix Checkbox"
```

---

### Task 7: Skeleton and Spinner

**Files:**
- Create: `frontend/packages/ui/src/components/Skeleton.tsx`
- Create: `frontend/packages/ui/src/components/Spinner.tsx`

- [ ] **Step 1: Create Skeleton.tsx**

```tsx
// frontend/packages/ui/src/components/Skeleton.tsx
import { cn } from "../utils";

interface SkeletonProps {
  className?: string;
  /** Shorthand: rounded pill shape */
  pill?: boolean;
}

export function Skeleton({ className, pill }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#F3F4F6]",
        pill ? "rounded-full" : "rounded-md",
        className
      )}
    />
  );
}

/** Convenience: a row of skeleton lines */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          pill
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create Spinner.tsx**

```tsx
// frontend/packages/ui/src/components/Spinner.tsx
import { cn } from "../utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE: Record<string, string> = {
  sm: "w-3.5 h-3.5 border-[1.5px]",
  md: "w-5 h-5 border-2",
  lg: "w-7 h-7 border-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "block rounded-full border-[#E5E7EB] border-t-brand-700 animate-spin",
        SIZE[size],
        className
      )}
    />
  );
}
```

- [ ] **Step 3: Export from index.ts**

```
export { Skeleton, SkeletonText } from "./Skeleton";
export { Spinner } from "./Spinner";
```

- [ ] **Step 4: Commit**
```bash
git add frontend/packages/ui/src/components/Skeleton.tsx frontend/packages/ui/src/components/Spinner.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Skeleton, SkeletonText, Spinner loading states"
```

---

### Task 8: Eyebrow, KbdHint, EmptyState

**Files:**
- Create: `frontend/packages/ui/src/components/Eyebrow.tsx`
- Create: `frontend/packages/ui/src/components/KbdHint.tsx`
- Create: `frontend/packages/ui/src/components/EmptyState.tsx`

- [ ] **Step 1: Create Eyebrow.tsx**

```tsx
// frontend/packages/ui/src/components/Eyebrow.tsx
import { cn } from "../utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-700", className)}>
      {children}
    </p>
  );
}
```

- [ ] **Step 2: Create KbdHint.tsx**

```tsx
// frontend/packages/ui/src/components/KbdHint.tsx
import { cn } from "../utils";

export function KbdHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB]",
        "text-[11px] font-mono font-medium text-[#6B7280] bg-[#F9FAFB]",
        "leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}
```

- [ ] **Step 3: Create EmptyState.tsx**

```tsx
// frontend/packages/ui/src/components/EmptyState.tsx
import { cn } from "../utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Icon component from lucide-react — rendered at 40px */
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center px-6", className)}>
      {Icon && (
        <Icon size={40} strokeWidth={1.5} className="text-[#D1D5DB] mb-4" />
      )}
      <p className="text-[15px] font-semibold text-[#374151] mb-1">{title}</p>
      <p className="text-[13px] text-[#6B7280] max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Export from index.ts**

```
export { Eyebrow } from "./Eyebrow";
export { KbdHint } from "./KbdHint";
export { EmptyState } from "./EmptyState";
```

- [ ] **Step 5: Commit**
```bash
git add frontend/packages/ui/src/components/Eyebrow.tsx frontend/packages/ui/src/components/KbdHint.tsx frontend/packages/ui/src/components/EmptyState.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Eyebrow, KbdHint, EmptyState utility components"
```

---

### Task 9: Tooltip and Dropdown (Radix wrappers)

**Files:**
- Create: `frontend/packages/ui/src/components/Tooltip.tsx`
- Create: `frontend/packages/ui/src/components/Dropdown.tsx`

Note: Both wrap Radix primitives. `@radix-ui/react-tooltip` must be added to consuming apps.

- [ ] **Step 1: Add @radix-ui/react-tooltip to portals**

```bash
cd frontend/admin-portal && pnpm add @radix-ui/react-tooltip
cd frontend/employee-portal && pnpm add @radix-ui/react-tooltip
cd frontend/superadmin-portal && pnpm add @radix-ui/react-tooltip
```

- [ ] **Step 2: Create Tooltip.tsx**

```tsx
// frontend/packages/ui/src/components/Tooltip.tsx
"use client";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../utils";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

export function Tooltip({ content, children, side = "top", delayDuration = 300 }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 px-2.5 py-1.5 rounded-md text-[12px] font-medium",
              "bg-[#1F2937] text-white shadow-lg",
              "animate-in fade-in-0 zoom-in-95"
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-[#1F2937]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
```

- [ ] **Step 3: Create Dropdown.tsx — simple trigger + items wrapper**

```tsx
// frontend/packages/ui/src/components/Dropdown.tsx
"use client";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const DropdownRoot = RadixDropdown.Root;
export const DropdownTrigger = RadixDropdown.Trigger;

interface DropdownContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export function DropdownContent({ children, align = "end", className }: DropdownContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] rounded-xl border border-[#E5E7EB] bg-surface shadow-lg p-1",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
}

export function DropdownItem({ children, onSelect, danger, disabled, className }: DropdownItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] cursor-pointer outline-none",
        "focus:bg-[#F3F4F6]",
        danger ? "text-error focus:bg-red-50" : "text-[#374151]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownSeparator() {
  return <RadixDropdown.Separator className="h-px bg-[#E5E7EB] my-1 -mx-1" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <RadixDropdown.Label className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
      {children}
    </RadixDropdown.Label>
  );
}
```

- [ ] **Step 4: Export from index.ts**

```
export { Tooltip } from "./Tooltip";
export { DropdownRoot, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from "./Dropdown";
```

- [ ] **Step 5: Commit**
```bash
git add frontend/packages/ui/src/components/Tooltip.tsx frontend/packages/ui/src/components/Dropdown.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Tooltip, Dropdown — Radix wrappers with brand styling"
```

---

### Task 10: Dialog and Sheet

**Files:**
- Create: `frontend/packages/ui/src/components/Dialog.tsx`
- Create: `frontend/packages/ui/src/components/Sheet.tsx`

Dialog replaces `BaseModal` for new code. BaseModal stays for existing callers.

- [ ] **Step 1: Create Dialog.tsx**

```tsx
// frontend/packages/ui/src/components/Dialog.tsx
"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

interface DialogContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function DialogContent({
  title,
  description,
  children,
  className,
  maxWidth = "max-w-lg",
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/30 animate-in fade-in-0" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-full bg-surface rounded-2xl shadow-2xl border border-[#E5E7EB]",
          "p-6 animate-in fade-in-0 zoom-in-95",
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <RadixDialog.Title className="text-[18px] font-bold text-near-black leading-tight">
              {title}
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-[13px] text-[#6B7280] mt-1">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="rounded-md p-1 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber">
            <X size={16} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
```

- [ ] **Step 2: Create Sheet.tsx (slide-in panel)**

```tsx
// frontend/packages/ui/src/components/Sheet.tsx
"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const SheetRoot = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;

interface SheetContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "left";
  width?: string;
}

export function SheetContent({
  title,
  description,
  children,
  side = "right",
  width = "w-full max-w-md",
}: SheetContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/30 animate-in fade-in-0" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 top-0 bottom-0 bg-surface shadow-2xl border-l border-[#E5E7EB]",
          "flex flex-col animate-in slide-in-from-right",
          side === "right" ? "right-0" : "left-0 border-l-0 border-r border-[#E5E7EB]",
          width
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <RadixDialog.Title className="text-[16px] font-bold text-near-black">{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-[13px] text-[#6B7280] mt-0.5">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="rounded-md p-1 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber">
            <X size={16} />
          </RadixDialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
```

- [ ] **Step 3: Export from index.ts**

```
export { DialogRoot, DialogTrigger, DialogContent } from "./Dialog";
export { SheetRoot, SheetTrigger, SheetContent } from "./Sheet";
```

- [ ] **Step 4: Commit**
```bash
git add frontend/packages/ui/src/components/Dialog.tsx frontend/packages/ui/src/components/Sheet.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): Dialog, Sheet — Radix-based modal and slide-in panel"
```

---

### Task 11: InlineAlert

**Files:**
- Create: `frontend/packages/ui/src/components/InlineAlert.tsx`

- [ ] **Step 1: Create InlineAlert.tsx**

```tsx
// frontend/packages/ui/src/components/InlineAlert.tsx
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const CONFIG: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  info:    { icon: Info,          classes: "bg-blue-50 border-blue-200 text-blue-800" },
  success: { icon: CheckCircle,   classes: "bg-brand-50 border-brand-100 text-brand-800" },
  warning: { icon: AlertTriangle, classes: "bg-amber-light border-amber-light text-[#92600A]" },
  error:   { icon: XCircle,       classes: "bg-red-50 border-red-200 text-red-700" },
};

interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onRetry?: () => void;
}

export function InlineAlert({ variant = "info", title, children, className, onRetry }: InlineAlertProps) {
  const { icon: Icon, classes } = CONFIG[variant];
  return (
    <div className={cn("flex items-start gap-2.5 border rounded-xl px-4 py-3 text-[13px]", classes, className)}>
      <Icon size={15} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{children}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] font-semibold underline underline-offset-2 hover:opacity-80 flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Export from index.ts**

Add: `export { InlineAlert } from "./InlineAlert";`

- [ ] **Step 3: Commit**
```bash
git add frontend/packages/ui/src/components/InlineAlert.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): InlineAlert — info/success/warning/error with optional retry"
```

---

### Task 12: MoneyAmount and FormField

**Files:**
- Create: `frontend/packages/ui/src/components/MoneyAmount.tsx`
- Create: `frontend/packages/ui/src/components/FormField.tsx`

- [ ] **Step 1: Create MoneyAmount.tsx**

Tabular figures are enforced by `font-variant-numeric: tabular-nums` — applied via Tailwind's `tabular-nums` utility.

```tsx
// frontend/packages/ui/src/components/MoneyAmount.tsx
import { cn } from "../utils";

interface MoneyAmountProps {
  amount: number | null | undefined;
  currency?: string;
  /** Show cents (2 decimal places) */
  cents?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Dim the component when amount is zero or null */
  dimZero?: boolean;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-[13px]",
  md: "text-[14px]",
  lg: "text-[18px] font-bold",
  xl: "text-[28px] font-bold leading-none",
};

export function MoneyAmount({
  amount,
  currency = "KES",
  cents = false,
  size = "md",
  className,
  dimZero = false,
}: MoneyAmountProps) {
  const isNull = amount == null;
  const isZero = amount === 0;

  if (isNull) {
    return (
      <span className={cn("tabular-nums text-[#9CA3AF]", SIZE_CLASSES[size], className)}>
        —
      </span>
    );
  }

  const formatted = amount.toLocaleString("en-KE", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

  return (
    <span
      className={cn(
        "tabular-nums font-mono",
        SIZE_CLASSES[size],
        dimZero && isZero ? "text-[#9CA3AF]" : "text-near-black",
        className
      )}
    >
      <span className="text-[0.75em] text-[#6B7280] mr-0.5 font-sans font-medium not-italic">{currency}</span>
      {formatted}
    </span>
  );
}
```

- [ ] **Step 2: Create FormField.tsx**

```tsx
// frontend/packages/ui/src/components/FormField.tsx
import { cn } from "../utils";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, hint, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-[#344054]"
      >
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[12px] text-[#6B7280]">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-error">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Export from index.ts**

```
export { MoneyAmount } from "./MoneyAmount";
export { FormField } from "./FormField";
```

- [ ] **Step 4: Commit**
```bash
git add frontend/packages/ui/src/components/MoneyAmount.tsx frontend/packages/ui/src/components/FormField.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): MoneyAmount (tabular-nums KES formatter), FormField (label+hint+error)"
```

---

### Task 13: PermissionGate, useCurrentRole, RoleBadge

**Files:**
- Create: `frontend/packages/ui/src/lib/useCurrentRole.ts`
- Create: `frontend/packages/ui/src/components/PermissionGate.tsx`
- Create: `frontend/packages/ui/src/components/RoleBadge.tsx`

Role is read from `X-User-Role` header forwarded by Next.js middleware. In RSC layouts it comes through `headers()`. Client components receive it as a prop or from a React context.

- [ ] **Step 1: Create useCurrentRole.ts**

```ts
// frontend/packages/ui/src/lib/useCurrentRole.ts
"use client";
import { createContext, useContext } from "react";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "PAYROLL_OFFICER"
  | "HR"
  | "LINE_MANAGER"
  | "EMPLOYEE"
  | null;

export const RoleContext = createContext<UserRole>(null);

/** Use inside client components that are children of a RoleProvider. */
export function useCurrentRole(): UserRole {
  return useContext(RoleContext);
}
```

- [ ] **Step 2: Create PermissionGate.tsx**

```tsx
// frontend/packages/ui/src/components/PermissionGate.tsx
"use client";
import type { ReactNode } from "react";
import { useCurrentRole, type UserRole } from "../lib/useCurrentRole";

interface PermissionGateProps {
  /** Roles that are allowed to see children */
  allow: UserRole[];
  /** Rendered when the role is not allowed — defaults to nothing */
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ allow, fallback = null, children }: PermissionGateProps) {
  const role = useCurrentRole();
  if (role === null || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

/** Context provider — wrap the shell layout with this */
export { RoleContext } from "../lib/useCurrentRole";
```

- [ ] **Step 3: Create RoleBadge.tsx**

```tsx
// frontend/packages/ui/src/components/RoleBadge.tsx
import { cn } from "../utils";
import type { UserRole } from "../lib/useCurrentRole";

const LABEL: Record<NonNullable<UserRole>, string> = {
  SUPER_ADMIN:      "Super Admin",
  ADMIN:            "Admin",
  HR_MANAGER:       "HR Manager",
  PAYROLL_OFFICER:  "Payroll Officer",
  HR:               "HR",
  LINE_MANAGER:     "Line Manager",
  EMPLOYEE:         "Employee",
};

const COLOR: Record<NonNullable<UserRole>, string> = {
  SUPER_ADMIN:     "bg-brand-900 text-white",
  ADMIN:           "bg-brand-100 text-brand-800",
  HR_MANAGER:      "bg-amber-light text-[#92600A]",
  PAYROLL_OFFICER: "bg-[#E0F2FE] text-[#0369A1]",
  HR:              "bg-brand-50 text-brand-700",
  LINE_MANAGER:    "bg-[#F3E8FF] text-[#6B21A8]",
  EMPLOYEE:        "bg-[#F3F4F6] text-[#374151]",
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold",
        COLOR[role],
        className
      )}
    >
      {LABEL[role]}
    </span>
  );
}
```

- [ ] **Step 4: Export from index.ts**

```
export { useCurrentRole, RoleContext, type UserRole } from "./lib/useCurrentRole";
export { PermissionGate } from "./components/PermissionGate";
export { RoleBadge } from "./components/RoleBadge";
```

- [ ] **Step 5: Commit**
```bash
git add frontend/packages/ui/src/lib/useCurrentRole.ts frontend/packages/ui/src/components/PermissionGate.tsx frontend/packages/ui/src/components/RoleBadge.tsx frontend/packages/ui/src/components/index.ts frontend/packages/ui/src/index.ts
git commit -m "feat(ui): PermissionGate, useCurrentRole, RoleBadge — role-aware rendering primitives"
```

---

### Task 14: useOnlineStatus and OfflineBadge

**Files:**
- Create: `frontend/packages/ui/src/lib/useOnlineStatus.ts`
- Create: `frontend/packages/ui/src/components/OfflineBadge.tsx`

- [ ] **Step 1: Create useOnlineStatus.ts**

```ts
// frontend/packages/ui/src/lib/useOnlineStatus.ts
"use client";
import { useState, useEffect } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Initialise from browser
    setOnline(navigator.onLine);
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
```

- [ ] **Step 2: Create OfflineBadge.tsx**

```tsx
// frontend/packages/ui/src/components/OfflineBadge.tsx
"use client";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { cn } from "../utils";

export function OfflineBadge({ className }: { className?: string }) {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
        "bg-amber-light text-[#92600A] text-[12px] font-semibold",
        className
      )}
    >
      <WifiOff size={11} />
      Offline
    </span>
  );
}
```

- [ ] **Step 3: Export from index.ts**

```
export { useOnlineStatus } from "./lib/useOnlineStatus";
export { OfflineBadge } from "./components/OfflineBadge";
```

- [ ] **Step 4: Commit**
```bash
git add frontend/packages/ui/src/lib/useOnlineStatus.ts frontend/packages/ui/src/components/OfflineBadge.tsx frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): useOnlineStatus hook, OfflineBadge — PWA offline indicator"
```

---

### Task 15: Update packages/ui/src/index.ts and migrate import paths

**Files:**
- Modify: `frontend/packages/ui/src/index.ts`
- Modify: `frontend/packages/ui/src/components/index.ts`

- [ ] **Step 1: Rewrite packages/ui/src/index.ts to export everything**

```ts
// frontend/packages/ui/src/index.ts
// ── Utilities ──────────────────────────────────────────────────────────────
export { cn } from "./utils";

// ── Brand ──────────────────────────────────────────────────────────────────
export { LogoFull } from "./components/LogoFull";
export { Logomark } from "./components/Logomark";

// ── Primitives ─────────────────────────────────────────────────────────────
export { Button } from "./components/Button";
export type { ButtonVariant, ButtonSize } from "./components/Button";
export { Badge } from "./components/Badge";
export type { BadgeStatus } from "./components/Badge";
export { Avatar } from "./components/Avatar";
export { Tag, tagColorFor } from "./components/Tag";
export type { TagColor } from "./components/Tag";
export { Input } from "./components/Input";
export { Textarea } from "./components/Textarea";
export { Select } from "./components/Select";
export { Checkbox } from "./components/Checkbox";
export { Switch } from "./components/Switch";
export { Skeleton, SkeletonText } from "./components/Skeleton";
export { Spinner } from "./components/Spinner";
export { Eyebrow } from "./components/Eyebrow";
export { KbdHint } from "./components/KbdHint";
export { EmptyState } from "./components/EmptyState";
export { Tooltip } from "./components/Tooltip";
export {
  DropdownRoot, DropdownTrigger, DropdownContent,
  DropdownItem, DropdownSeparator, DropdownLabel,
} from "./components/Dropdown";
export { DialogRoot, DialogTrigger, DialogContent } from "./components/Dialog";
export { SheetRoot, SheetTrigger, SheetContent } from "./components/Sheet";
export { InlineAlert } from "./components/InlineAlert";
export { MoneyAmount } from "./components/MoneyAmount";
export { FormField } from "./components/FormField";

// ── Role & Permission ──────────────────────────────────────────────────────
export { useCurrentRole, RoleContext } from "./lib/useCurrentRole";
export type { UserRole } from "./lib/useCurrentRole";
export { PermissionGate } from "./components/PermissionGate";
export { RoleBadge } from "./components/RoleBadge";

// ── Offline ────────────────────────────────────────────────────────────────
export { useOnlineStatus } from "./lib/useOnlineStatus";
export { OfflineBadge } from "./components/OfflineBadge";

// ── Legacy — kept for existing portal callers, replaced in Plan B ──────────
export { BaseModal } from "./components/BaseModal";
export { ToastProvider, useToast } from "./components/Toaster";
export { PageHeader } from "./components/PageHeader";
export { QueryProvider } from "./components/QueryProvider";
export { SidebarShell } from "./components/SidebarShell";
export type { NavItem, NavSection } from "./components/SidebarShell";
```

- [ ] **Step 2: Run type-check on all portals**

```bash
cd frontend/admin-portal && npx tsc --noEmit 2>&1 | head -30
cd frontend/superadmin-portal && npx tsc --noEmit 2>&1 | head -30
cd frontend/employee-portal && npx tsc --noEmit 2>&1 | head -30
```
Expected: zero type errors in all three.

- [ ] **Step 3: Commit**
```bash
git add frontend/packages/ui/src/index.ts frontend/packages/ui/src/components/index.ts
git commit -m "feat(ui): unified public API in index.ts — 30 primitives exported"
```

---

### Task 16: /preview route in admin-portal

**Files:**
- Create: `frontend/admin-portal/src/app/preview/layout.tsx`
- Create: `frontend/admin-portal/src/app/preview/page.tsx`

The preview route is unprotected (no auth middleware) for easy local review. It shows every primitive in every variant. It must be excluded from production builds via `NEXT_PUBLIC_SHOW_PREVIEW !== "true"` check at the page level.

- [ ] **Step 1: Create preview/layout.tsx**

```tsx
// frontend/admin-portal/src/app/preview/layout.tsx
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-alt p-8 font-body">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create preview/page.tsx**

```tsx
// frontend/admin-portal/src/app/preview/page.tsx
"use client";
import {
  Button, Badge, Avatar, Tag, tagColorFor,
  Input, Textarea, Select, Checkbox, Switch,
  Skeleton, SkeletonText, Spinner,
  Eyebrow, KbdHint, EmptyState,
  Tooltip, DropdownRoot, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator,
  DialogRoot, DialogTrigger, DialogContent,
  InlineAlert,
  MoneyAmount,
  FormField,
  RoleBadge,
  OfflineBadge,
} from "@andikisha/ui";
import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-5 pb-2 border-b border-[#E5E7EB]">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-3 min-w-[220px]">
      <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

export default function PreviewPage() {
  const [checked, setChecked] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-[28px] font-bold text-near-black mb-2">@andikisha/ui — Component Preview</h1>
      <p className="text-[14px] text-[#6B7280] mb-10">Sprint 1 primitives. Every variant. Brand tokens only.</p>

      {/* Button */}
      <Section title="Button">
        <Button variant="cta">+ New Tenant</Button>
        <Button variant="primary">Sign in</Button>
        <Button variant="secondary">Export report</Button>
        <Button variant="outline">View details</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="lg">Large</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </Section>

      {/* Badge */}
      <Section title="Badge">
        <Badge status="active">Active</Badge>
        <Badge status="approved">Approved</Badge>
        <Badge status="paid">Paid</Badge>
        <Badge status="pending">Pending</Badge>
        <Badge status="draft">Draft</Badge>
        <Badge status="rejected">Rejected</Badge>
        <Badge status="failed">Failed</Badge>
        <Badge status="cancelled">Cancelled</Badge>
        <Badge status="suspended">Suspended</Badge>
        <Badge status="trial">Trial</Badge>
      </Section>

      {/* Avatar */}
      <Section title="Avatar">
        <Avatar name="Sarah Wanjiku" size="xs" />
        <Avatar name="James Otieno" size="sm" />
        <Avatar name="Grace Kamau" size="md" />
        <Avatar name="Daniel Kariuki" size="lg" />
        <Avatar size="md" />
      </Section>

      {/* Tag */}
      <Section title="Tag — pastel category swatches">
        {(["Engineering", "Finance", "HR", "Operations", "Legal", "Sales", "Marketing"] as const).map(dept => (
          <Tag key={dept} color={tagColorFor(dept)}>{dept}</Tag>
        ))}
        <Tag color="sage" size="sm">Small sage</Tag>
      </Section>

      {/* RoleBadge */}
      <Section title="RoleBadge">
        <RoleBadge role="SUPER_ADMIN" />
        <RoleBadge role="ADMIN" />
        <RoleBadge role="HR_MANAGER" />
        <RoleBadge role="PAYROLL_OFFICER" />
        <RoleBadge role="HR" />
        <RoleBadge role="LINE_MANAGER" />
        <RoleBadge role="EMPLOYEE" />
      </Section>

      {/* MoneyAmount */}
      <Section title="MoneyAmount (tabular-nums)">
        <Card title="Sizes">
          <MoneyAmount amount={123456.78} cents size="sm" />
          <MoneyAmount amount={123456.78} cents size="md" />
          <MoneyAmount amount={123456.78} size="lg" />
          <MoneyAmount amount={123456.78} size="xl" />
        </Card>
        <Card title="Edge cases">
          <MoneyAmount amount={null} />
          <MoneyAmount amount={0} dimZero />
          <MoneyAmount amount={1234567890} />
        </Card>
      </Section>

      {/* Form primitives */}
      <Section title="Form">
        <Card title="Input">
          <FormField label="Email" htmlFor="prev-email" hint="We'll never share your email">
            <Input
              id="prev-email"
              type="email"
              placeholder="you@company.com"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
          </FormField>
          <FormField label="Password" error="Password is required" htmlFor="prev-pwd">
            <Input id="prev-pwd" type="password" placeholder="••••••••" error />
          </FormField>
        </Card>
        <Card title="Select + Checkbox + Switch">
          <FormField label="Department">
            <Select>
              <option>Finance</option>
              <option>Engineering</option>
              <option>HR</option>
            </Select>
          </FormField>
          <label className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            Remember me
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
            <Switch checked={switched} onCheckedChange={setSwitched} />
            Email notifications
          </label>
        </Card>
        <Card title="Textarea">
          <FormField label="Notes">
            <Textarea rows={4} placeholder="Add a note…" />
          </FormField>
        </Card>
      </Section>

      {/* Loading */}
      <Section title="Loading states">
        <Card title="Skeleton">
          <Skeleton className="h-4 w-full" />
          <SkeletonText lines={3} />
        </Card>
        <Card title="Spinner">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Card>
      </Section>

      {/* Utility components */}
      <Section title="Utility">
        <Card title="Eyebrow + KbdHint">
          <Eyebrow>Section heading</Eyebrow>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#374151]">Press</span>
            <KbdHint>⌘</KbdHint>
            <KbdHint>K</KbdHint>
          </div>
        </Card>
        <Card title="OfflineBadge">
          <p className="text-[12px] text-[#9CA3AF]">(Goes offline to see it)</p>
          <OfflineBadge />
        </Card>
      </Section>

      {/* InlineAlert */}
      <Section title="InlineAlert">
        <div className="flex flex-col gap-3 w-full max-w-xl">
          <InlineAlert variant="info">Your session expires in 15 minutes.</InlineAlert>
          <InlineAlert variant="success" title="Payslips generated">46 payslips processed for May 2026.</InlineAlert>
          <InlineAlert variant="warning">Pending leave requests need approval before payroll runs.</InlineAlert>
          <InlineAlert variant="error" onRetry={() => {}}>Could not connect to payroll service. Check your connection.</InlineAlert>
        </div>
      </Section>

      {/* EmptyState */}
      <Section title="EmptyState">
        <div className="bg-surface border border-[#E5E7EB] rounded-xl w-full max-w-md">
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Add your first employee to start running payroll and managing leave requests."
            action={<Button variant="cta">+ Add Employee</Button>}
          />
        </div>
      </Section>

      {/* Dialog */}
      <Section title="Dialog + Sheet">
        <DialogRoot>
          <DialogTrigger asChild>
            <Button variant="secondary">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent title="Approve Leave Request" description="Review and approve the leave request below.">
            <p className="text-[14px] text-[#374151] mb-5">Annual leave for James Otieno — 5 days, 1–5 Dec 2026.</p>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1">Approve</Button>
              <Button variant="secondary" className="flex-1">Decline</Button>
            </div>
          </DialogContent>
        </DialogRoot>

        <DropdownRoot>
          <DropdownTrigger asChild>
            <Button variant="secondary">
              Actions <ChevronDown size={14} />
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={() => {}}>Edit employee</DropdownItem>
            <DropdownItem onSelect={() => {}}>View payslips</DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={() => {}} danger>Terminate</DropdownItem>
          </DropdownContent>
        </DropdownRoot>

        <Tooltip content="Opens the command palette">
          <Button variant="ghost">
            Hover for tooltip
          </Button>
        </Tooltip>
      </Section>
    </div>
  );
}
```

- [ ] **Step 3: Exclude from middleware (preview must bypass auth)**

Open `frontend/admin-portal/src/middleware.ts`. Find the matcher config and ensure `/preview` is excluded. Add to the negative lookahead if not already there:

```ts
// In the matcher, add /preview to the bypass list (same pattern as /login):
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|preview).*)"],
};
```

- [ ] **Step 4: Start dev server and verify**

```bash
cd frontend/admin-portal && pnpm dev
```
Open `http://localhost:3001/preview` in a browser. All sections should render without errors. Spot-check: buttons have no blue, badges have brand green/amber/gray, MoneyAmount shows tabular numbers.

- [ ] **Step 5: Commit**
```bash
git add frontend/admin-portal/src/app/preview/
git add frontend/admin-portal/src/middleware.ts  # if changed
git commit -m "feat(admin-portal): /preview route — visual catalogue of all Sprint 1 primitives"
```

---

## Conflicts and notes for the reviewer

1. **Button primary vs CTA**: The brand doc says "amber is the only colour allowed on CTA buttons." However, all existing login/form-submit buttons across all portals use `bg-brand-900` (dark green). This plan treats `variant="primary"` as `bg-brand-900` (for form submits, drawer confirms) and `variant="cta"` as `bg-amber` (for top-level dashboard CTAs). If the reviewer wants to swap, change `VARIANTS.primary` in Button.tsx.

2. **Canvas colour**: The sample SVG uses `#FAFAFA`. The brand doc specifies `surface-alt = #F8F7F4`. The plan uses `surface-alt` (`#F8F7F4`) everywhere as the canvas — it is warmer and consistent with the landing page. If the reviewer prefers the cooler `#FAFAFA`, change `surface-alt` in all three portals' `globals.css` / `tailwind.config.ts`.

3. **`superadmin-portal` is Tailwind v3**: All components in this plan use only standard Tailwind utility classes that exist in both v3 and v4 (no v4-only features). Brand token names match between v3 config and v4 `@theme {}`.

4. **Radix packages are peer dependencies**: Components that wrap Radix (Checkbox, Tooltip, Dropdown, Dialog, Sheet) require the relevant `@radix-ui/*` package in the consuming app. The plan installs them in Task 6 and Task 9.
