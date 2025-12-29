import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { getLicensesForEmail } from "@/lib/license-db";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch licenses for the customer's email
    const licenses = await getLicensesForEmail(customer.email);

    return NextResponse.json({
      success: true,
      licenses: licenses.map(license => ({
        id: license.id,
        plan: license.plan,
        license_key: license.license_key,
        expires_at: license.expires_at,
        status: license.status,
        created_at: license.created_at,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch customer licenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

