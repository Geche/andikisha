"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Lock,
  Building2,
  Briefcase,
  Users,
  Receipt,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkspaceSetupState {
  deptCount: number;
  posCount: number;
  empCount: number;
  payrollCount: number;
}

type StepStatus = "active" | "complete" | "locked";

function getStatuses({
  deptCount,
  posCount,
  empCount,
  payrollCount,
}: WorkspaceSetupState): [StepStatus, StepStatus, StepStatus, StepStatus] {
  const s1: StepStatus = deptCount > 0 ? "complete" : "active";
  const s2: StepStatus = posCount > 0 ? "complete" : "active";
  const s3: StepStatus =
    empCount > 0
      ? "complete"
      : deptCount > 0 && posCount > 0
      ? "active"
      : "locked";
  const s4: StepStatus =
    payrollCount > 0 ? "complete" : empCount > 0 ? "active" : "locked";
  return [s1, s2, s3, s4];
}

// ─── StepCard ────────────────────────────────────────────────────────────────

interface StepCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  status: StepStatus;
  lockReason?: string;
  completeLabel?: string;
  viewHref?: string;
  children?: React.ReactNode;
}

function StepCard({
  number,
  icon,
  title,
  description,
  status,
  lockReason,
  completeLabel,
  viewHref,
  children,
}: StepCardProps) {
  const router = useRouter();
  const workspace = useWorkspace();
  const isComplete = status === "complete";
  const isLocked = status === "locked";

  return (
    <div
      className={[
        "rounded-xl border transition-all duration-200",
        isComplete
          ? "bg-surface-alt border-neutral-200"
          : isLocked
          ? "bg-surface-alt border-neutral-200 opacity-60"
          : "bg-surface border-brand-600 border-l-4",
      ].join(" ")}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Step number / icon */}
          <div
            className={[
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isComplete
                ? "bg-brand-50"
                : isLocked
                ? "bg-neutral-100"
                : "bg-brand-50",
            ].join(" ")}
          >
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-brand-600" />
            ) : isLocked ? (
              <Lock className="w-4 h-4 text-neutral-300" />
            ) : (
              <span className="text-[13px] font-bold text-brand-700">
                {number}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className={[
                  "text-[14px] font-semibold",
                  isLocked ? "text-neutral-400" : "text-near-black",
                ].join(" ")}
              >
                {title}
              </span>
              {isComplete && (
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              )}
            </div>

            {isComplete && completeLabel ? (
              <div className="flex items-center gap-3">
                <p className="text-[13px] text-neutral-500">{completeLabel}</p>
                {viewHref && (
                  <button
                    onClick={() => router.push(viewHref)}
                    className="text-[13px] font-semibold text-brand-700 hover:underline"
                  >
                    View →
                  </button>
                )}
              </div>
            ) : (
              <p
                className={[
                  "text-[13px] leading-relaxed",
                  isLocked ? "text-neutral-400" : "text-neutral-500",
                ].join(" ")}
              >
                {description}
              </p>
            )}

            {isLocked && lockReason && (
              <p className="text-[12px] text-neutral-400 mt-1">{lockReason}</p>
            )}

            {!isComplete && !isLocked && children && (
              <div className="flex flex-col sm:flex-row gap-2 mt-4">{children}</div>
            )}
          </div>

          {/* Right icon (decorative, desktop only) */}
          <div className="hidden sm:flex flex-shrink-0 text-neutral-200">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface WorkspaceSetupChecklistProps {
  state: WorkspaceSetupState;
  onStepComplete: () => void;
}

export function WorkspaceSetupChecklist({
  state,
  onStepComplete,
}: WorkspaceSetupChecklistProps) {
  const router = useRouter();
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const [s1, s2, s3, s4] = getStatuses(state);

  const invalidateSetup = () => {
    void queryClient.invalidateQueries({ queryKey: ["workspace-depts"] });
    void queryClient.invalidateQueries({ queryKey: ["workspace-positions"] });
    onStepComplete();
  };

  const seedDepts = useMutation({
    mutationFn: () =>
      apiClient.post<{ name: string }[]>(
        "/api/v1/departments/seed-defaults"
      ),
    onSuccess: invalidateSetup,
  });

  const seedPositions = useMutation({
    mutationFn: () =>
      apiClient.post<{ title: string }[]>(
        "/api/v1/positions/seed-defaults"
      ),
    onSuccess: invalidateSetup,
  });

  const { deptCount, posCount, empCount, payrollCount } = state;

  return (
    <div className="flex flex-col gap-4">
      {/* Step 1: Departments */}
      <StepCard
        number={1}
        icon={<Building2 className="w-8 h-8" />}
        title="Add departments"
        description="Departments group employees and structure your payroll reports."
        status={s1}
        completeLabel={`${deptCount} department${deptCount === 1 ? "" : "s"} created`}
        viewHref={`/${workspace}/admin/settings/departments`}
      >
        <Button
          variant="primary"
          onClick={() => seedDepts.mutate()}
          disabled={seedDepts.isPending}
          className="w-full sm:w-auto"
        >
          {seedDepts.isPending ? "Creating…" : "Use suggested defaults"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/${workspace}/admin/settings/departments`)}
          className="w-full sm:w-auto"
        >
          Add custom department
        </Button>
      </StepCard>

      {/* Step 2: Positions */}
      <StepCard
        number={2}
        icon={<Briefcase className="w-8 h-8" />}
        title="Add positions"
        description="Positions define job titles and grade levels."
        status={s2}
        completeLabel={`${posCount} position${posCount === 1 ? "" : "s"} created`}
        viewHref={`/${workspace}/admin/settings/positions`}
      >
        <Button
          variant="primary"
          onClick={() => seedPositions.mutate()}
          disabled={seedPositions.isPending}
          className="w-full sm:w-auto"
        >
          {seedPositions.isPending ? "Creating…" : "Use suggested defaults"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/${workspace}/admin/settings/positions`)}
          className="w-full sm:w-auto"
        >
          Add custom position
        </Button>
      </StepCard>

      {/* Step 3: First employee */}
      <StepCard
        number={3}
        icon={<Users className="w-8 h-8" />}
        title="Add your first employee"
        description="Create an employee record with their personal, statutory, and salary details."
        status={s3}
        lockReason="Add departments and positions first"
        completeLabel={`${empCount} employee${empCount === 1 ? "" : "s"} added`}
        viewHref={`/${workspace}/admin/employees`}
      >
        <Button
          variant="primary"
          onClick={() => router.push(`/${workspace}/admin/employees/new`)}
          className="w-full sm:w-auto"
        >
          Add employee
        </Button>
      </StepCard>

      {/* Step 4: First payroll run */}
      <StepCard
        number={4}
        icon={<Receipt className="w-8 h-8" />}
        title="Run your first payroll"
        description="Calculate payroll, review payslips, and disburse via M-Pesa."
        status={s4}
        lockReason="Add your first employee first"
        completeLabel="First payroll run complete"
        viewHref={`/${workspace}/admin/payroll`}
      >
        <Button
          variant="primary"
          onClick={() => router.push(`/${workspace}/admin/payroll/new`)}
          className="w-full sm:w-auto"
        >
          Run payroll
        </Button>
      </StepCard>
    </div>
  );
}
