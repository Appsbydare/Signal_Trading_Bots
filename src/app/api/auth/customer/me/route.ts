import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    // Fetch customer name and country from customers table
    const { data: customerData } = await supabase
      .from("customers")
      .select("name, country")
      .eq("id", customer.id)
      .single();

    // Fetch customer licenses
    const { data: licenses } = await supabase
      .from("licenses")
      .select("*")
      .eq("email", customer.email)
      .neq("status", "revoked")
      .order("created_at", { ascending: false });

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        password_set_by_user: customer.password_set_by_user,
        name: customerData?.name || null,
        country: customerData?.country || null,
        licenses: licenses || [],
      },
    });
  } catch (error) {
    console.error("Failed to get current customer:", error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}

