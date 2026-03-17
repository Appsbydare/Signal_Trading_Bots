import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCodeEmail } from "@/lib/email";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 5 OTP requests per IP per hour to prevent flooding
    if (!checkRateLimit(`send-otp:${getClientIp(request)}`, { limit: 5, windowSeconds: 3600 })) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if customer already exists with this email
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single();

    // Return the same generic response regardless — prevents account enumeration
    if (existingCustomer) {
      return NextResponse.json({
        success: true,
        message: "If this email is not yet registered, a verification code has been sent.",
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete any existing unverified codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("verified", false);

    // Store code in database
    const { error: dbError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { success: false, message: "Failed to generate verification code" },
        { status: 500 }
      );
    }

    // Send email
    try {
      await sendVerificationCodeEmail({
        to: email,
        code,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

