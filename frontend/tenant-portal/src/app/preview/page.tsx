"use client";
import {
  Button, Badge, Avatar, Tag, tagColorFor,
  Input, Textarea, Select, Checkbox, Switch,
  Skeleton, SkeletonText, Spinner,
  Eyebrow, KbdHint, EmptyState,
  Tooltip,
  DropdownRoot, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator,
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
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-5 pb-2 border-b border-neutral-200">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-neutral-200 rounded-xl p-5 flex flex-col gap-3 min-w-[220px]">
      <p className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

const DEPARTMENTS = ["Engineering", "Finance", "HR", "Operations", "Legal", "Sales", "Marketing"];

export default function PreviewPage() {
  const [checked, setChecked] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-[28px] font-bold text-near-black mb-2">@andikisha/ui — Component Preview</h1>
      <p className="text-[14px] text-neutral-500 mb-10">
        Sprint 1 primitives. Every variant. Brand tokens only. No purple, no blue-600.
      </p>

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

      <Section title="Badge — status variants">
        <Badge status="active">Active</Badge>
        <Badge status="approved">Approved</Badge>
        <Badge status="paid">Paid</Badge>
        <Badge status="pending">Pending</Badge>
        <Badge status="draft">Draft</Badge>
        <Badge status="calculating">Calculating</Badge>
        <Badge status="trial">Trial</Badge>
        <Badge status="rejected">Rejected</Badge>
        <Badge status="failed">Failed</Badge>
        <Badge status="cancelled">Cancelled</Badge>
        <Badge status="terminated">Terminated</Badge>
        <Badge status="suspended">Suspended</Badge>
      </Section>

      <Section title="Avatar">
        <Avatar name="Sarah Wanjiku" size="xs" />
        <Avatar name="James Otieno" size="sm" />
        <Avatar name="Grace Kamau" size="md" />
        <Avatar name="Daniel Kariuki" size="lg" />
        <Avatar size="md" />
      </Section>

      <Section title="Tag — pastel category swatches">
        {DEPARTMENTS.map(dept => (
          <Tag key={dept} color={tagColorFor(dept)}>{dept}</Tag>
        ))}
        <Tag color="sage" size="sm">Small sage</Tag>
      </Section>

      <Section title="RoleBadge">
        <RoleBadge role="SUPER_ADMIN" />
        <RoleBadge role="ADMIN" />
        <RoleBadge role="HR_MANAGER" />
        <RoleBadge role="PAYROLL_OFFICER" />
        <RoleBadge role="HR" />
        <RoleBadge role="LINE_MANAGER" />
        <RoleBadge role="EMPLOYEE" />
      </Section>

      <Section title="MoneyAmount — tabular-nums KES">
        <Card title="Sizes">
          <MoneyAmount amount={123456.78} cents size="sm" />
          <MoneyAmount amount={123456.78} cents size="md" />
          <MoneyAmount amount={123456.78} size="lg" />
          <MoneyAmount amount={123456.78} size="xl" />
        </Card>
        <Card title="Edge cases">
          <MoneyAmount amount={null} />
          <MoneyAmount amount={0} dimZero />
          <MoneyAmount amount={1_234_567_890} />
        </Card>
      </Section>

      <Section title="Form primitives">
        <Card title="Input">
          <FormField label="Email" htmlFor="prev-email" hint="We'll never share your email.">
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
          <label className="flex items-center gap-2 text-[13px] text-neutral-700 cursor-pointer">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            Remember me for 30 days
          </label>
          <label className="flex items-center gap-2 text-[13px] text-neutral-700 cursor-pointer">
            <Switch checked={switched} onCheckedChange={setSwitched} />
            Email notifications
          </label>
        </Card>
        <Card title="Textarea">
          <FormField label="Leave reason">
            <Textarea rows={4} placeholder="Brief reason for leave…" />
          </FormField>
        </Card>
      </Section>

      <Section title="Loading states">
        <Card title="Skeleton">
          <Skeleton className="h-4 w-full" />
          <SkeletonText lines={3} />
        </Card>
        <Card title="Spinner">
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Card>
      </Section>

      <Section title="Utility">
        <Card title="Eyebrow + KbdHint">
          <Eyebrow>Section heading</Eyebrow>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-neutral-700">Press</span>
            <KbdHint>⌘</KbdHint>
            <KbdHint>K</KbdHint>
          </div>
        </Card>
        <Card title="OfflineBadge">
          <p className="text-[12px] text-neutral-400">Visible when offline.</p>
          <OfflineBadge />
        </Card>
      </Section>

      <Section title="InlineAlert">
        <div className="flex flex-col gap-3 w-full max-w-xl">
          <InlineAlert variant="info">Your session expires in 15 minutes.</InlineAlert>
          <InlineAlert variant="success" title="Payslips generated">
            46 payslips processed for May 2026.
          </InlineAlert>
          <InlineAlert variant="warning">
            Pending leave requests need approval before payroll runs.
          </InlineAlert>
          <InlineAlert variant="error" onRetry={() => undefined}>
            Could not connect to payroll service. Check your connection.
          </InlineAlert>
        </div>
      </Section>

      <Section title="EmptyState">
        <div className="bg-surface border border-neutral-200 rounded-xl w-full max-w-md">
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Add your first employee to start running payroll and managing leave requests."
            action={<Button variant="cta">+ Add Employee</Button>}
          />
        </div>
      </Section>

      <Section title="Dialog + Dropdown + Tooltip">
        <DialogRoot>
          <DialogTrigger asChild>
            <Button variant="secondary">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent
            title="Approve Leave Request"
            description="Review and approve the leave request below."
          >
            <p className="text-[14px] text-neutral-700 mb-5">
              Annual leave for James Otieno — 5 days, 1–5 Dec 2026.
            </p>
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
            <DropdownItem onSelect={() => undefined}>Edit employee</DropdownItem>
            <DropdownItem onSelect={() => undefined}>View payslips</DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={() => undefined} danger>Terminate</DropdownItem>
          </DropdownContent>
        </DropdownRoot>

        <Tooltip content="Opens the global command palette">
          <Button variant="ghost">Hover for tooltip</Button>
        </Tooltip>
      </Section>
    </div>
  );
}
