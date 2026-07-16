"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, UserMinus, AlertTriangle, Settings2 } from "lucide-react";
import {
  PageHeader, Badge, Skeleton, EmptyState, Button, PermissionGate,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";
import type { LifecycleType, LifecycleInstance } from "@/types/lifecycle";
import { InstanceDetailSheet } from "./InstanceDetailSheet";
import { TemplatesSheet } from "./TemplatesSheet";
import {
  BOARD_COLUMNS,
  instanceBadgeStatus,
  instanceStatusLabel,
  daysInStageLabel,
} from "./helpers";

interface LifecyclePipelineProps {
  type: LifecycleType;
}

const COPY: Record<LifecycleType, { title: string; subtitle: string; icon: typeof UserPlus; emptyTitle: string; emptyDesc: string }> = {
  ONBOARDING: {
    title: "Onboarding",
    subtitle: "New-hire pipeline",
    icon: UserPlus,
    emptyTitle: "No onboarding in progress",
    emptyDesc: "Start onboarding from an employee's profile to add them to this pipeline.",
  },
  OFFBOARDING: {
    title: "Offboarding",
    subtitle: "Exit pipeline",
    icon: UserMinus,
    emptyTitle: "No offboarding in progress",
    emptyDesc: "Start offboarding from an employee's profile to add them to this pipeline.",
  },
};

export function LifecyclePipeline({ type }: LifecyclePipelineProps) {
  const workspace = useWorkspace();
  const { nameFor } = useEmployeeNames();
  const copy = COPY[type];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery<LifecycleInstance[]>({
    queryKey: ["lifecycle-instances", type],
    queryFn: () =>
      apiClient
        .get<LifecycleInstance[]>("/api/v1/employees/lifecycle/instances", { params: { type } })
        .then((r) => r.data),
  });

  const instances = data ?? [];
  const selected = instances.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={copy.title}
        subtitle={
          isLoading ? "Loading…" : `${instances.length} active workflow${instances.length === 1 ? "" : "s"}`
        }
        actions={
          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <Button variant="secondary" size="md" onClick={() => setShowTemplates(true)}>
              <Settings2 size={15} aria-hidden="true" />
              Manage templates
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-6">
        {isError ? (
          <ListErrorState error={error} noun={`${copy.title.toLowerCase()} workflows`} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <BoardSkeleton />
        ) : instances.length === 0 ? (
          <EmptyState icon={copy.icon} title={copy.emptyTitle} description={copy.emptyDesc} />
        ) : (
          /* Stage board. The column headers carry their own counts, so there is no
             separate summary row — it would repeat the same four labels and numbers. */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {BOARD_COLUMNS.map((col) => {
              const colInstances = instances.filter((i) => col.statuses.includes(i.status));
              return (
                <section key={col.key} className="flex flex-col min-h-64">
                  <header className="flex items-center justify-between gap-2 px-0.5 pb-2 mb-3 border-b border-neutral-200">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 font-mono tabular-nums">
                      {colInstances.length}
                    </span>
                  </header>
                  <div className="flex flex-col gap-2.5">
                    {colInstances.length === 0 ? (
                      <p className="px-1 py-8 text-center text-[12px] text-neutral-300">Nothing here</p>
                    ) : (
                      colInstances.map((inst) => (
                        <InstanceCard
                          key={inst.id}
                          instance={inst}
                          employeeName={nameFor(inst.employeeId)}
                          onOpen={() => setSelectedId(inst.id)}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <InstanceDetailSheet
          instanceId={selected.id}
          fallback={selected}
          employeeName={nameFor(selected.employeeId)}
          workspace={workspace}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showTemplates && <TemplatesSheet type={type} onClose={() => setShowTemplates(false)} />}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function InstanceCard({
  instance,
  employeeName,
  onOpen,
}: {
  instance: LifecycleInstance;
  employeeName: string;
  onOpen: () => void;
}) {
  const blocked = instance.status === "BLOCKED";
  const pct =
    instance.totalTaskCount > 0
      ? Math.round((instance.completedTaskCount / instance.totalTaskCount) * 100)
      : 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl bg-white border border-neutral-200 shadow-sm p-4 hover:border-brand-500 hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-900/30"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13.5px] font-semibold text-near-black truncate">{employeeName}</p>
        <Badge status={instanceBadgeStatus(instance.status)}>{instanceStatusLabel(instance.status)}</Badge>
      </div>

      {blocked && (
        <div className="flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold text-danger">
          <AlertTriangle size={12} aria-hidden="true" />
          Needs attention
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-[11.5px] text-neutral-400">{daysInStageLabel(instance.startedAt)}</span>
        <span className="text-[11.5px] font-semibold text-neutral-500 font-mono tabular-nums">
          {instance.completedTaskCount}/{instance.totalTaskCount}
        </span>
      </div>

      {/* Task progress */}
      <div
        role="progressbar"
        aria-valuenow={instance.completedTaskCount}
        aria-valuemin={0}
        aria-valuemax={instance.totalTaskCount}
        aria-label={`${instance.completedTaskCount} of ${instance.totalTaskCount} tasks complete`}
        className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden"
      >
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
      {Array.from({ length: 4 }).map((_, i) => (
        <section key={i} className="flex flex-col min-h-64">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
            <Skeleton pill className="h-2.5 w-20" />
            <Skeleton pill className="h-2.5 w-4" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
        </section>
      ))}
    </div>
  );
}
