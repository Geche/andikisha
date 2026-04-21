"use client";

import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  employees: string;
  message: string;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  employees: "",
  message: "",
};

const EMPLOYEE_OPTIONS = ["1 – 10", "11 – 30", "31 – 100", "101 – 300", "300+"];

const SUBMIT_DELAY_MS = 300;

async function submitDemoRequest(
  data: FormState
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  // Ensure minimum perceived progress so the button doesn't flash
  await new Promise((r) => setTimeout(r, SUBMIT_DELAY_MS));
  return res.json();
}

export default function DemoForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email is required";
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.employees) e.employees = "Please select team size";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitDemoRequest(form);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-brand-700" aria-hidden="true" />
        </div>
        <h3 className="font-display font-bold text-[24px] text-neutral-900">
          Request received!
        </h3>
        <p className="text-[15px] text-neutral-600 max-w-[340px] leading-relaxed">
          We will be in touch within 2 hours with calendar options. Check your
          email at <strong>{form.email}</strong>.
        </p>
        <p className="text-[13px] text-neutral-400">
          In the meantime, you can also reach us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="demo-name" className="form-label">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="demo-name"
          type="text"
          className="form-input"
          placeholder="Wanjiru Mwangi"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          aria-describedby={errors.name ? "demo-name-error" : undefined}
          autoComplete="name"
        />
        {errors.name && (
          <p id="demo-name-error" className="form-error">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="demo-email" className="form-label">
          Work email <span className="text-red-500">*</span>
        </label>
        <input
          id="demo-email"
          type="email"
          className="form-input"
          placeholder="wanjiru@company.co.ke"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-describedby={errors.email ? "demo-email-error" : undefined}
          autoComplete="email"
        />
        {errors.email && (
          <p id="demo-email-error" className="form-error">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="demo-company" className="form-label">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            id="demo-company"
            type="text"
            className="form-input"
            placeholder="Acme Ltd"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            aria-describedby={errors.company ? "demo-company-error" : undefined}
            autoComplete="organization"
          />
          {errors.company && (
            <p id="demo-company-error" className="form-error">{errors.company}</p>
          )}
        </div>

        <div>
          <label htmlFor="demo-phone" className="form-label">
            Phone number
          </label>
          <input
            id="demo-phone"
            type="tel"
            className="form-input"
            placeholder="+254 700 000 000"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-employees" className="form-label">
          Team size <span className="text-red-500">*</span>
        </label>
        <select
          id="demo-employees"
          className="form-input"
          value={form.employees}
          onChange={(e) => update("employees", e.target.value)}
          aria-describedby={errors.employees ? "demo-employees-error" : undefined}
        >
          <option value="" disabled>Select number of employees</option>
          {EMPLOYEE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o} employees</option>
          ))}
        </select>
        {errors.employees && (
          <p id="demo-employees-error" className="form-error">{errors.employees}</p>
        )}
      </div>

      <div>
        <label htmlFor="demo-message" className="form-label">
          Anything specific you want to cover?
        </label>
        <textarea
          id="demo-message"
          rows={3}
          className="form-textarea"
          placeholder="e.g. We have a mix of permanent and casual staff, and we currently file KRA manually..."
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>

      {submitError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[14px] text-red-700">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary btn-lg justify-center w-full disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? "Submitting..." : "Book My Demo Session"}
      </button>

      <p className="text-center text-[12px] text-neutral-400">
        No obligation. We respond within 2 hours on business days.
      </p>
    </form>
  );
}
