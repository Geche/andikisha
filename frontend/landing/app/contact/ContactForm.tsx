"use client";

import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: "", email: "", subject: "", message: "" };

const SUBJECT_OPTIONS = [
  "Sales enquiry",
  "Product demo",
  "Technical support",
  "Partnership / reseller",
  "Billing question",
  "Other",
];

async function submitContact(
  data: FormState
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.subject) e.subject = "Please select a subject";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitContact(form);
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
        <h3 className="font-display font-bold text-[22px] text-neutral-900">
          Message sent!
        </h3>
        <p className="text-[15px] text-neutral-600 max-w-[320px] leading-relaxed">
          We will reply to <strong>{form.email}</strong> within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="form-label">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            className="form-input"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <p id="contact-name-error" className="form-error">{errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            className="form-input"
            placeholder="you@company.co.ke"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="contact-email-error" className="form-error">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="form-label">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          id="contact-subject"
          className="form-input"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
        >
          <option value="" disabled>Select a subject</option>
          {SUBJECT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.subject && (
          <p id="contact-subject-error" className="form-error">{errors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="form-label">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className="form-textarea"
          placeholder="Tell us what you need..."
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="form-error">{errors.message}</p>
        )}
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
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
