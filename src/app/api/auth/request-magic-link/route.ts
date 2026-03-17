import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/auth-users";
import { createMagicLinkToken } from "@/lib/auth-tokens";
import { sendMagicLinkEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 5 magic links per IP per 10 minutes — prevents email bombing
  if (!checkRateLimit(`magic:${getClientIp(request)}`, { limit: 5, windowSeconds: 600 })) {
    return NextResponse.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Always return the same success response regardless of whether the email
    // exists — prevents account enumeration by timing or response content.
    const customer = await getCustomerByEmail(email);

    if (customer) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com";
      const token = await createMagicLinkToken(email);
      const magicLinkUrl = `${baseUrl}/api/auth/magic-login?token=${token}`;

      try {
        await sendMagicLinkEmail({ to: email, magicLinkUrl });
      } catch (emailError) {
        console.error("Failed to send magic link email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a magic link has been sent.",
    });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

