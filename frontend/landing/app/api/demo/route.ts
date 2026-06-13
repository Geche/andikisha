import { NextResponse } from "next/server";
import { isValidEmail, isBot, tooLong, sanitizeHeader, MAX } from "@/lib/validation";

interface DemoPayload {
  name: string;
  email: string;
  company: string;
  phone?: string;
  employees: string;
  message?: string;
  website?: string; // honeypot
}

export async function POST(request: Request) {
  try {
    const body: DemoPayload = await request.json();

    // Silently accept bot submissions so they don't retry, but do nothing.
    if (isBot(body)) {
      return NextResponse.json({ ok: true });
    }

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

    if (
      tooLong(body.name, MAX.name) ||
      tooLong(body.company, MAX.company) ||
      tooLong(body.phone, MAX.phone) ||
      tooLong(body.employees, MAX.employees) ||
      tooLong(body.message, MAX.message)
    ) {
      return NextResponse.json(
        { ok: false, error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Without an email provider the lead goes nowhere. Make that loud in logs
      // and, in production, refuse rather than telling the visitor "received".
      console.error(
        "[demo] RESEND_API_KEY is not configured — demo request from %s was NOT delivered",
        sanitizeHeader(body.email)
      );
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { ok: false, error: "We couldn't submit your request. Please email hello@andikishahr.com." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "website@andikishahr.com",
      to: process.env.CONTACT_TO ?? "hello@andikishahr.com",
      replyTo: body.email,
      subject: `[Demo Request] ${sanitizeHeader(body.company)} — ${sanitizeHeader(body.employees)} employees`,
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[demo] failed to process demo request", err);
    return NextResponse.json(
      { ok: false, error: "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}
