import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { updateCustomerPassword } from "@/lib/auth-users";

export async function POST(request: NextRequest) {
  try {
    // Get current logged-in customer
    const customer = await getCurrentCustomer();
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Update password
    await updateCustomerPassword(customer.email, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}

