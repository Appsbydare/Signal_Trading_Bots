import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type AuthRole = "customer" | "admin";

export interface AuthJwtPayload extends JWTPayload {
  sub: string;
  role: AuthRole;
  email: string;
}

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET;

if (!AUTH_JWT_SECRET) {
  throw new Error("AUTH_JWT_SECRET is not configured. Set it in the environment to enable auth.");
}

const AUTH_SECRET_KEY = new TextEncoder().encode(AUTH_JWT_SECRET);

// 7 days by default
const AUTH_TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7);

export const CUSTOMER_COOKIE_NAME = "stb_session";
export const ADMIN_COOKIE_NAME = "stb_admin_session";

export async function createAuthToken(
  userId: number,
  email: string,
  role: AuthRole,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    sub: String(userId),
    role,
    email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + AUTH_TOKEN_TTL_SECONDS)
    .sign(AUTH_SECRET_KEY);
}

export async function createMagicLinkToken(
  email: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Magic links valid for 1 hour
  const MAGIC_LINK_TTL = 60 * 60;

  return await new SignJWT({
    email,
    purpose: "magic_login",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + MAGIC_LINK_TTL)
    .sign(AUTH_SECRET_KEY);
}

export async function verifyAuthToken(token: string): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify<AuthJwtPayload>(token, AUTH_SECRET_KEY);
    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET_KEY);
    if (!payload.email || payload.purpose !== "magic_login") {
      return null;
    }
    return payload.email as string;
  } catch {
    return null;
  }
}


