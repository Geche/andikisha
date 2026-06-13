import { NextResponse } from "next/server";
import { isValidEmail, isBot, sanitizeHeader } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = body?.email ?? "";

    if (isBot(body)) {
      return NextResponse.json({ ok: true });
    }

    if (!email.trim() || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "[newsletter] RESEND_API_KEY is not configured — subscription for %s was NOT recorded",
        sanitizeHeader(email)
      );
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { ok: false, error: "We couldn't subscribe you right now. Please try again later." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // Notify the team of the new subscriber
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "website@andikishahr.com",
      to: process.env.CONTACT_TO ?? "hello@andikishahr.com",
      subject: `[Newsletter] New subscriber: ${sanitizeHeader(email)}`,
      text: `New compliance newsletter signup: ${email}`,
    });

    // Send a welcome confirmation to the subscriber
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "website@andikishahr.com",
      to: email,
      subject: "You're subscribed to AndikishaHR compliance updates",
      text: [
        "Hi,",
        "",
        "You are now subscribed to compliance updates from AndikishaHR.",
        "",
        "We will email you when something changes that affects your Kenya payroll — KRA bracket updates, NSSF or SHIF rate changes, Housing Levy notices.",
        "",
        "That is all. No newsletters. No marketing. Just the updates that matter.",
        "",
        "Unsubscribe any time by replying to this email.",
        "",
        "The AndikishaHR team",
        "hello@andikishahr.com",
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] failed to process subscription", err);
    return NextResponse.json(
      { ok: false, error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
