import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, country } = body;

    // Prepare update object
    const updateData: { name?: string; country?: string } = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (country !== undefined) {
      updateData.country = country.trim();
    }

    // Update customer information in customers table
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("customers")
        .update(updateData)
        .eq("id", customer.id);

      if (error) {
        console.error("Error updating customer information:", error);
        return NextResponse.json(
          { error: "Failed to update information" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Personal information updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer info:", error);
    return NextResponse.json(
      { error: "An error occurred while updating information" },
      { status: 500 }
    );
  }
}

