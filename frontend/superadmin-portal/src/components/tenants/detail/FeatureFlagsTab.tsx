"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import type { FeatureFlag } from "@/types/tenant";

interface Props {
  tenantId: string;
}

export function FeatureFlagsTab({ tenantId }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading, isError } = useQuery<FeatureFlag[]>({
    queryKey: ["tenant-flags", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/feature-flags`).then((r) => r.data),
  });

  const toggle = useMutation({
    mutationFn: ({ key, enable }: { key: string; enable: boolean }) =>
      apiClient
        .put(`/api/v1/super-admin/tenants/${tenantId}/feature-flags/${key}/${enable ? "enable" : "disable"}`)
        .then((r) => r.data),
    onMutate: async ({ key, enable }) => {
      await queryClient.cancelQueries({ queryKey: ["tenant-flags", tenantId] });
      const prev = queryClient.getQueryData<FeatureFlag[]>(["tenant-flags", tenantId]);
      queryClient.setQueryData<FeatureFlag[]>(["tenant-flags", tenantId], (old = []) =>
        old.map((f) => (f.featureKey === key ? { ...f, enabled: enable } : f))
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["tenant-flags", tenantId], ctx?.prev);
      toast("Failed to update feature flag", "error");
    },
    onSuccess: (_, { enable, key }) => {
      toast(`${key} ${enable ? "enabled" : "disabled"}`, "success");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
        <AlertTriangle size={15} className="flex-shrink-0" />
        Could not load feature flags.
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
        <p className="text-[13px] text-gray-400">No feature flags configured for this tenant</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-[13px] font-bold text-[#02110C]">Feature Flags</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Toggles flip immediately with optimistic UI — changes persist to the backend.</p>
      </div>
      <div className="divide-y divide-gray-50">
        {flags.map((flag) => (
          <div key={flag.featureKey} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-[#02110C]">{flag.featureKey}</p>
              {flag.description && (
                <p className="text-[12px] text-gray-500 mt-0.5">{flag.description}</p>
              )}
            </div>
            <button
              onClick={() => toggle.mutate({ key: flag.featureKey, enable: !flag.enabled })}
              disabled={toggle.isPending}
              aria-label={flag.enabled ? "Disable flag" : "Enable flag"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                flag.enabled ? "bg-[#27A870]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  flag.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
