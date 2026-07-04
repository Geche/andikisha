"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import {
  type LeaveRequest,
  leaveTypeLabel,
  formatDateRange,
} from "./types";

interface ApproveModalProps {
  request: LeaveRequest;
  onClose: () => void;
}

export function ApproveModal({ request, onClose }: ApproveModalProps) {
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<LeaveRequest, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        // Send the optional reviewer note; the backend persists it as review_notes
        // and the request-detail view shows it (LEAVE-BACKLOG-001).
        .post<LeaveRequest>(
          `/api/v1/leave/requests/${request.id}/approve`,
          notes.trim() ? { notes: notes.trim() } : undefined,
        )
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["leave-request", request.id] });
      toast("Leave approved", "success");
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to approve leave request. Please try again.";
      toast(msg, "error");
    },
  });

  return (
    <BaseModal labelId="approve-leave-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[480px] p-6">
        <h2
          id="approve-leave-modal-title"
          className="text-[16px] font-bold text-neutral-900 mb-1"
        >
          Approve Leave Request
        </h2>
        <p className="text-[13px] text-neutral-500 mb-5">
          You are approving a leave request for{" "}
          <span className="font-semibold text-near-black">{request.employeeName}</span>.
        </p>

        {/* Summary */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 mb-5 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[13px]">
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Leave Type
            </p>
            <p className="text-near-black font-medium">{leaveTypeLabel(request.leaveType)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Days
            </p>
            <p className="text-near-black font-medium">{request.totalDays}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Dates
            </p>
            <p className="text-near-black font-medium">
              {formatDateRange(request.startDate, request.endDate)}
            </p>
          </div>
        </div>

        {/* Optional notes */}
        <div className="mb-6">
          <label
            htmlFor="approve-notes"
            className="block text-[12.5px] font-semibold text-neutral-600 mb-1.5"
          >
            Notes{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="approve-notes"
            rows={3}
            maxLength={300}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note for the employee…"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13px] text-near-black placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 resize-none"
          />
          <p className="text-right text-[11px] text-neutral-400 mt-1">{notes.length}/300</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Approving…" : "Approve Leave"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
