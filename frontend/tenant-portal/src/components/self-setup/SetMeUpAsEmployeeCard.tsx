"use client";

import { useState } from "react";
import { useCurrentUser, BaseModal, Button, Input, Spinner } from "@andikisha/ui";
import { UserPlus, CircleCheck, Clock } from "lucide-react";
import type { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";

type Phase = "idle" | "activating" | "done" | "pending";

// AUTH-BACKLOG-001: an admin-type user with no linked employee record can create a minimal one for
// themselves. Eligibility is by state (no employeeId), so this also covers HR_MANAGER, HR_OFFICER and
// PAYROLL_OFFICER who land on the same dashboard. Never keyed on the JWT claim — driven by
// /api/auth/me (via useCurrentUser), which reads the live user record.
//
// The card owns every post-submit state: the modal only collects input; on 201 it closes and the card
// switches in place through activating → done (nudge) or pending (neutral). The link is asynchronous,
// so the nudge appears only after /api/auth/me confirms the new employeeId by value.
//
// Nudge copy is deliberately minimal — it does NOT invite the admin to /my/*. The /my/leave request
// list is role-scoped, so a linked ADMIN would see tenant-wide leave there until the surface spec
// fixes it (see the FE- backlog item). Sending them to a leaking page would be a defect.
export function SetMeUpAsEmployeeCard() {
  const currentUser = useCurrentUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;
  if (currentUser.employeeId) return null; // already an employee — the natural end state
  if ((currentUser.roles ?? []).includes("SUPER_ADMIN")) return null;

  const openModal = () => {
    const parts = (currentUser.fullName ?? "").trim().split(/\s+/).filter(Boolean);
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setPhone(""); // /api/auth/me carries no phone; optional, left blank
    setError(null);
    setModalOpen(true);
  };

  const pollForLink = async (employeeId: string) => {
    for (const delay of [500, 1000, 2000, 4000]) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const me = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json());
        if (me?.employeeId === employeeId) {
          setPhase("done");
          return;
        }
      } catch {
        // transient — keep polling
      }
    }
    setPhase("pending"); // timed out; the broker retries and the link will land
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post<{ employeeId: string }>("/api/v1/employees/self", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim() || null,
      });
      setModalOpen(false);
      setPhase("activating");
      await pollForLink(res.data.employeeId);
    } catch (e) {
      const code = (e as AxiosError<{ error?: string }>)?.response?.data?.error;
      if (code === "EMAIL_IN_USE") {
        setError("An employee record already exists for your email. Ask your HR administrator to link it.");
      } else if (code === "ALREADY_LINKED") {
        setModalOpen(false);
        setPhase("done");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && !submitting;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      {phase === "idle" && (
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
            <UserPlus size={20} aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-green-900">Set yourself up as an employee</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Create your own employee record so you can use employee self-service alongside your admin
              tools. It takes a few seconds.
            </p>
            <Button className="mt-4" onClick={openModal}>
              Set me up as an employee
            </Button>
          </div>
        </div>
      )}

      {phase === "activating" && (
        <div className="flex items-center gap-3">
          <Spinner />
          <p className="text-sm text-neutral-600">Setting up your employee record…</p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <CircleCheck size={20} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold text-green-900">You&rsquo;re set up</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Log out and back in once to activate your self-service.
            </p>
          </div>
        </div>
      )}

      {phase === "pending" && (
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning text-white">
            <Clock size={20} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold text-green-900">Almost there</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Your employee record was created and is still activating. Check back shortly.
            </p>
          </div>
        </div>
      )}

      {modalOpen && (
        <BaseModal labelId="self-setup-title" onClose={() => !submitting && setModalOpen(false)}>
          <h2 id="self-setup-title" className="text-lg font-semibold text-green-900">
            Set yourself up as an employee
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            We&rsquo;ll create your employee record so you can use self-service.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">First name</span>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Last name</span>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Phone number (optional)</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
              <Input value={currentUser.email} readOnly disabled />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              {submitting ? "Setting up…" : "Confirm"}
            </Button>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
