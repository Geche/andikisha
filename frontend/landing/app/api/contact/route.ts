import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body: ContactPayload = await request.json();

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

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "website@andikishahr.com",
        to: process.env.CONTACT_TO ?? "hello@andikishahr.com",
        replyTo: body.email,
        subject: `[Contact] ${body.subject} — ${body.name}`,
        text: [
          `Name:    ${body.name}`,
          `Email:   ${body.email}`,
          `Subject: ${body.subject}`,
          "",
          body.message,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
