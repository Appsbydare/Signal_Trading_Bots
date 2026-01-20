import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCustomerByEmail, createCustomer } from "@/lib/auth-users";
import { createAuthToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = user.email;
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            );
        }

        // Sync with local customers table
        let customer = await getCustomerByEmail(email);

        if (!customer) {
            // Create new customer
            // Generate a random high-entropy password since we use Supabase Auth
            const randomPassword =
                Math.random().toString(36).slice(-8) +
                Math.random().toString(36).slice(-8) +
                "!" +
                Date.now();

            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0];

            customer = await createCustomer({
                email,
                password: randomPassword,
                name: fullName,
            });
        }

        // Generate Application JWT
        const token = await createAuthToken(
            customer.id,
            customer.email,
            "customer",
            customer.password_set_by_user
        );

        const response = NextResponse.json(
            { success: true, message: "Session synced" },
            { status: 200 }
        );

        // Set Application Cookie
        response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7),
        });

        return response;
    } catch (err) {
        console.error("Sync session error:", err);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
