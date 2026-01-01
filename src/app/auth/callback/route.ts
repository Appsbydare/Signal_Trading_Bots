import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCustomerByEmail, createCustomer } from "@/lib/auth-users";
import { createAuthToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/portal";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Sync logic
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user && user.email) {
                let customer = await getCustomerByEmail(user.email);

                if (!customer) {
                    const randomPassword =
                        Math.random().toString(36).slice(-8) +
                        Math.random().toString(36).slice(-8) +
                        "!" +
                        Date.now();
                    const fullName =
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email.split("@")[0];

                    try {
                        customer = await createCustomer({
                            email: user.email,
                            password: randomPassword,
                            name: fullName,
                        });
                    } catch (e) {
                        console.error("Failed to create customer during sync", e);
                    }
                }

                if (customer) {
                    const token = await createAuthToken(
                        customer.id,
                        customer.email,
                        "customer",
                        customer.password_set_by_user
                    );

                    const response = NextResponse.redirect(`${origin}${next}`);
                    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
                        httpOnly: true,
                        sameSite: "lax",
                        secure: process.env.NODE_ENV === "production",
                        path: "/",
                        maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7),
                    });
                    return response;
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
