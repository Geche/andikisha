"use client";

import { useState, useTransition } from "react";
import { CheckCircle } from "lucide-react";

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

async function submitContact(data: FormState): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 800));
  console.log("Contact form:", data);
  return { ok: true };
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
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
    startTransition(async () => {
      const result = await submitContact(form);
      if (result.ok) setSubmitted(true);
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
            autoComplete="name"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
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
            autoComplete="email"
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
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
        >
          <option value="" disabled>Select a subject</option>
          {SUBJECT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.subject && <p className="form-error">{errors.subject}</p>}
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
        />
        {errors.message && <p className="form-error">{errors.message}</p>}
      </div>

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
