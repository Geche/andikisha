"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal, Ban, CheckCircle2, Clock, Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import { ConfirmModal } from "./ConfirmModal";
import { SuspendModal } from "./SuspendModal";
import { ExtendTrialModal } from "./ExtendTrialModal";
import type { TenantStatus } from "@/types/tenant";

interface Props {
  tenantId: string;
  status: TenantStatus;
}

export function TenantActionMenu({ tenantId, status }: Props) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"suspend" | "reactivate" | "extend" | "delete" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const suspend = useMutation({
    mutationFn: (reason: string) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant suspended", "warning");
      setModal(null);
    },
    onError: () => toast("Failed to suspend tenant", "error"),
  });

  const reactivate = useMutation({
    mutationFn: () =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant reactivated", "success");
      setModal(null);
    },
    onError: () => toast("Failed to reactivate tenant", "error"),
  });

  const extendTrial = useMutation({
    mutationFn: (additionalDays: number) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/extend-trial`, { additionalDays }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Trial extended", "success");
      setModal(null);
    },
    onError: () => toast("Failed to extend trial", "error"),
  });

  const cancel = useMutation({
    mutationFn: () =>
      apiClient.delete(`/api/v1/super-admin/tenants/${tenantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant cancelled", "warning");
      router.push("/tenants");
    },
    onError: () => toast("Failed to cancel tenant", "error"),
  });

  const canSuspend    = status === "ACTIVE" || status === "TRIAL";
  const canReactivate = status === "SUSPENDED";
  const canExtend     = status === "TRIAL";
  const canDelete     = status !== "CANCELLED" && status !== "DELETED";

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Tenant actions"
        >
          <MoreHorizontal size={15} /> Actions
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
            {canSuspend && (
              <button
                onClick={() => { setOpen(false); setModal("suspend"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <Ban size={14} className="text-amber-500" /> Suspend Tenant
              </button>
            )}
            {canReactivate && (
              <button
                onClick={() => { setOpen(false); setModal("reactivate"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle2 size={14} className="text-[#27A870]" /> Reactivate
              </button>
            )}
            {canExtend && (
              <button
                onClick={() => { setOpen(false); setModal("extend"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <Clock size={14} className="text-[#166A50]" /> Extend Trial
              </button>
            )}
            {canDelete && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => { setOpen(false); setModal("delete"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Cancel Tenant
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {modal === "suspend" && (
        <SuspendModal
          isPending={suspend.isPending}
          onConfirm={(reason) => suspend.mutate(reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "reactivate" && (
        <ConfirmModal
          title="Reactivate Tenant"
          message="This will restore full access for the tenant. Confirm reactivation?"
          confirmLabel="Reactivate"
          confirmVariant="primary"
          isPending={reactivate.isPending}
          onConfirm={() => reactivate.mutate()}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "extend" && (
        <ExtendTrialModal
          isPending={extendTrial.isPending}
          onConfirm={(days) => extendTrial.mutate(days)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title="Cancel Tenant"
          message="This will permanently cancel the tenant's subscription. All access will be revoked. This cannot be undone."
          confirmLabel="Cancel Tenant"
          confirmVariant="danger"
          isPending={cancel.isPending}
          onConfirm={() => cancel.mutate()}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
