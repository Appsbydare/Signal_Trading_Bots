import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { updateCustomerPassword, verifyCustomerPassword, getCustomerByEmail } from "@/lib/auth-users";
import { createAuthToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";

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
    const { newPassword, currentPassword } = body;

    // Validate password requirements
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    // If user already has a password set, verify current password
    if (customer.password_set_by_user && currentPassword) {
      const customerData = await getCustomerByEmail(customer.email);
      if (!customerData) {
        return NextResponse.json(
          { success: false, message: "Customer not found" },
          { status: 404 }
        );
      }

      const isValid = await verifyCustomerPassword(customer.email, currentPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 401 }
        );
      }
    } else if (customer.password_set_by_user && !currentPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is required" },
        { status: 400 }
      );
    }

    // Update password
    await updateCustomerPassword(customer.email, newPassword);

    // Create a new JWT token with password_set_by_user: true
    const newToken = await createAuthToken(customer.id, customer.email, "customer", true);

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });

    // Update the session cookie with the new token
    response.cookies.set(CUSTOMER_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7),
    });

    return response;
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}

