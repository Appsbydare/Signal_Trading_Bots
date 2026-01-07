import { NextRequest, NextResponse } from "next/server";
import { createCustomer, getCustomerByEmail } from "@/lib/auth-users";
import { createMagicLinkToken } from "@/lib/auth-tokens";
import { sendMagicLinkEmail } from "@/lib/email";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  let body: { fullName?: string; email?: string; country?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  const country = body.country?.trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { success: false, message: "Valid email is required" },
      { status: 400 },
    );
  }

  if (!fullName) {
    return NextResponse.json(
      { success: false, message: "Full name is required" },
      { status: 400 },
    );
  }

  // Check if customer already exists
  const existingCustomer = await getCustomerByEmail(email);
  if (existingCustomer) {
    return NextResponse.json(
      { success: false, message: "An account with this email already exists. Please log in instead." },
      { status: 409 },
    );
  }

  try {
    // Generate a random temporary password
    // The user will set their own password via magic link or password reset
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    // Create customer account
    const customer = await createCustomer({
      email,
      password: randomPassword,
      name: fullName,
    });

    // Update country if provided
    if (country) {
      const supabase = getSupabaseClient();
      await supabase
        .from("customers")
        .update({ country })
        .eq("id", customer.id);
    }

    // Generate and send magic link email
    try {
      const host = request.headers.get("host") || "www.signaltradingbots.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      const token = await createMagicLinkToken(email);
      const magicLinkUrl = `${protocol}://${host}/api/auth/magic-login?token=${token}`;

      await sendMagicLinkEmail({
        to: email,
        magicLinkUrl,
      });
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
      // Don't fail registration if email fails - user can request magic link later
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Check your email for a magic link to log in.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle duplicate email error
    if (error.code === '23505' && error.message?.includes('customers_email_key')) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Please log in instead." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}





