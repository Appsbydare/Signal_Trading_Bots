import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken, createAuthToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";
import { getCustomerByEmail } from "@/lib/auth-users";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. Verify Magic Link Token
    const email = await verifyMagicLinkToken(token);

    if (!email) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 2. Get Customer
    const customer = await getCustomerByEmail(email);

    if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 3. Create Session Token (Standard Login Token)
    const sessionToken = await createAuthToken(customer.id, customer.email, "customer", customer.password_set_by_user ?? false);

    // 4. Set Cookie and Redirect
    const response = NextResponse.redirect(new URL("/portal", request.url));

    response.cookies.set(CUSTOMER_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7),
    });

    return response;
}
