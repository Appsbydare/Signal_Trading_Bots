import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/auth-users";
import { createMagicLinkToken } from "@/lib/auth-tokens";
import { sendMagicLinkEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await getCustomerByEmail(email);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email address. Please check your email or contact support if you believe this is an error."
        },
        { status: 404 }
      );
    }

    // Generate magic link with production URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com";
    const token = await createMagicLinkToken(email);
    const magicLinkUrl = `${baseUrl}/api/auth/magic-login?token=${token}`;

    // Send email
    try {
      await sendMagicLinkEmail({
        to: email,
        magicLinkUrl,
      });
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
      // Don't reveal email sending failure to user
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your email inbox for a secure login link.",
    });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

