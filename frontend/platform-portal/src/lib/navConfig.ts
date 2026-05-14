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
      { label: "Feature Flags", href: "/tenants/feature-flags" },
      { label: "Usage Metrics", href: "/tenants/usage" },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/billing/invoices" },
      { label: "Plans & Pricing", href: "/billing/plans" },
      { label: "Revenue Reports", href: "/billing/revenue" },
    ],
  },
  {
    label: "Compliance",
    href: "/compliance",
    icon: BookOpen,
    children: [
      { label: "PAYE Brackets", href: "/compliance/paye" },
      { label: "NSSF Rates", href: "/compliance/nssf" },
      { label: "SHIF Rates", href: "/compliance/shif" },
      { label: "Housing Levy", href: "/compliance/housing-levy" },
      { label: "Rate Scheduler", href: "/compliance/scheduler" },
      { label: "Regulatory Changelog", href: "/compliance/changelog" },
    ],
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
    children: [
      { label: "KRA iTax", href: "/integrations/kra" },
      { label: "NSSF", href: "/integrations/nssf" },
      { label: "SHIF", href: "/integrations/shif" },
      { label: "M-Pesa (Daraja)", href: "/integrations/mpesa" },
      { label: "Africa's Talking", href: "/integrations/africastalking" },
      { label: "Webhook Log", href: "/integrations/webhooks" },
    ],
  },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
    children: [
      { label: "Tenant Tickets", href: "/support/tickets" },
      { label: "SLA Policies", href: "/support/sla" },
      { label: "Agents", href: "/support/agents" },
    ],
  },
  { label: "Users", href: "/users", icon: Users },
  {
    label: "Audit",
    href: "/audit",
    icon: Shield,
    children: [
      { label: "Cross-Tenant Log", href: "/audit/log" },
      { label: "Security Events", href: "/audit/security" },
      { label: "KDPA Requests", href: "/audit/kdpa" },
    ],
  },
  {
    label: "System",
    href: "/system",
    icon: Activity,
    children: [
      { label: "Service Health", href: "/system/health" },
      { label: "Queue Monitor", href: "/system/queues" },
      { label: "Traces", href: "/system/traces" },
      { label: "API Gateway", href: "/system/gateway" },
    ],
  },
  {
    label: "Communications",
    href: "/communications",
    icon: Megaphone,
    children: [
      { label: "Announcements", href: "/communications/announcements" },
      { label: "Maintenance Notices", href: "/communications/maintenance" },
      { label: "Templates", href: "/communications/templates" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Platform Config", href: "/settings/platform" },
      { label: "Rate Limits", href: "/settings/rate-limits" },
      { label: "Feature Rollouts", href: "/settings/features" },
    ],
  },
];
