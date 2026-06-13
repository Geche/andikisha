import { NextResponse } from "next/server";
import { isValidEmail, isBot, tooLong, sanitizeHeader, MAX } from "@/lib/validation";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
}

export async function POST(request: Request) {
  try {
    const body: ContactPayload = await request.json();

    if (isBot(body)) {
      return NextResponse.json({ ok: true });
    }

    if (
      !body.name?.trim() ||
      !body.email?.trim() ||
      !body.subject?.trim() ||
      !body.message?.trim()
    ) {
      return NextResponse.json(
        { ok: false, error: "All fields are required." },
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
      tooLong(body.subject, MAX.subject) ||
      tooLong(body.message, MAX.message)
    ) {
      return NextResponse.json(
        { ok: false, error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "[contact] RESEND_API_KEY is not configured — message from %s was NOT delivered",
        sanitizeHeader(body.email)
      );
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { ok: false, error: "We couldn't send your message. Please email hello@andikishahr.com." },
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
      subject: `[Contact] ${sanitizeHeader(body.subject)} — ${sanitizeHeader(body.name)}`,
      text: [
        `Name:    ${body.name}`,
        `Email:   ${body.email}`,
        `Subject: ${body.subject}`,
        "",
        body.message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] failed to process contact message", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
