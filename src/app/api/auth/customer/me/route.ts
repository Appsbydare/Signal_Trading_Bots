import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        password_set_by_user: customer.password_set_by_user,
      },
    });
  } catch (error) {
    console.error("Failed to get current customer:", error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}

