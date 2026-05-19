import type { HorizontalNavItem } from "@andikisha/ui";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BookOpen,
  Plug,
  LifeBuoy,
  Users,
  Shield,
  Activity,
  Megaphone,
  Settings,
} from "lucide-react";

export const platformNavConfig: HorizontalNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Tenants",
    href: "/tenants",
    icon: Building2,
    children: [
      { label: "All Tenants", href: "/tenants" },
      { label: "Provision Tenant", href: "/tenants/new" },
      { label: "Feature Flags", href: "/tenants/feature-flags", comingSoon: true },
      { label: "Usage Metrics", href: "/tenants/usage", comingSoon: true },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/billing/invoices", comingSoon: true },
      { label: "Plans & Pricing", href: "/billing/plans", comingSoon: true },
      { label: "Revenue Reports", href: "/billing/revenue", comingSoon: true },
    ],
  },
  {
    label: "Compliance",
    href: "/compliance",
    icon: BookOpen,
    children: [
      { label: "PAYE Brackets", href: "/compliance/paye", comingSoon: true },
      { label: "NSSF Rates", href: "/compliance/nssf", comingSoon: true },
      { label: "SHIF Rates", href: "/compliance/shif", comingSoon: true },
      { label: "Housing Levy", href: "/compliance/housing-levy", comingSoon: true },
      { label: "Rate Scheduler", href: "/compliance/scheduler", comingSoon: true },
      { label: "Regulatory Changelog", href: "/compliance/changelog", comingSoon: true },
    ],
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
    children: [
      { label: "KRA iTax", href: "/integrations/kra", comingSoon: true },
      { label: "NSSF", href: "/integrations/nssf", comingSoon: true },
      { label: "SHIF", href: "/integrations/shif", comingSoon: true },
      { label: "M-Pesa (Daraja)", href: "/integrations/mpesa", comingSoon: true },
      { label: "Africa's Talking", href: "/integrations/africastalking", comingSoon: true },
      { label: "Webhook Log", href: "/integrations/webhooks", comingSoon: true },
    ],
  },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
    children: [
      { label: "Tenant Tickets", href: "/support/tickets", comingSoon: true },
      { label: "SLA Policies", href: "/support/sla", comingSoon: true },
      { label: "Agents", href: "/support/agents", comingSoon: true },
    ],
  },
  { label: "Users", href: "/users", icon: Users },
  {
    label: "Audit",
    href: "/audit",
    icon: Shield,
    children: [
      { label: "Cross-Tenant Log", href: "/audit/log", comingSoon: true },
      { label: "Security Events", href: "/audit/security", comingSoon: true },
      { label: "KDPA Requests", href: "/audit/kdpa", comingSoon: true },
    ],
  },
  {
    label: "System",
    href: "/system",
    icon: Activity,
    children: [
      { label: "Service Health", href: "/system/health", comingSoon: true },
      { label: "Queue Monitor", href: "/system/queues", comingSoon: true },
      { label: "Traces", href: "/system/traces", comingSoon: true },
      { label: "API Gateway", href: "/system/gateway", comingSoon: true },
    ],
  },
  {
    label: "Communications",
    href: "/communications",
    icon: Megaphone,
    children: [
      { label: "Announcements", href: "/communications/announcements", comingSoon: true },
      { label: "Maintenance Notices", href: "/communications/maintenance", comingSoon: true },
      { label: "Templates", href: "/communications/templates", comingSoon: true },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Platform Config", href: "/settings/platform", comingSoon: true },
      { label: "Rate Limits", href: "/settings/rate-limits", comingSoon: true },
      { label: "Feature Rollouts", href: "/settings/features", comingSoon: true },
    ],
  },
];
