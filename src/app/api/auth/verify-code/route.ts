import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and code are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find the verification code
    const { data: verification, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("verified", false)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Check if expired
    const expiresAt = new Date(verification.expires_at);
    if (new Date() > expiresAt) {
      // Delete expired code
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verification.id);

      return NextResponse.json(
        { success: false, message: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("email_verification_codes")
      .update({ verified: true })
      .eq("id", verification.id);

    if (updateError) {
      console.error("Failed to mark code as verified:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

