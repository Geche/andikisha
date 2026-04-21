import { NextResponse } from "next/server";

interface DemoPayload {
  name: string;
  email: string;
  company: string;
  phone?: string;
  employees: string;
  message?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body: DemoPayload = await request.json();

    if (
      !body.name?.trim() ||
      !body.email?.trim() ||
      !body.company?.trim() ||
      !body.employees?.trim()
    ) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "website@andikishahr.com",
        to: process.env.CONTACT_TO ?? "hello@andikishahr.com",
        replyTo: body.email,
        subject: `[Demo Request] ${body.company} — ${body.employees} employees`,
        text: [
          `Name:      ${body.name}`,
          `Email:     ${body.email}`,
          `Company:   ${body.company}`,
          `Phone:     ${body.phone || "—"}`,
          `Team size: ${body.employees}`,
          "",
          body.message ? `Notes:\n${body.message}` : "",
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}
