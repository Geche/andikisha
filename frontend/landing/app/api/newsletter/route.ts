import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Notify the team of the new subscriber
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "website@andikishahr.com",
        to: process.env.CONTACT_TO ?? "hello@andikishahr.com",
        subject: `[Newsletter] New subscriber: ${email}`,
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
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
