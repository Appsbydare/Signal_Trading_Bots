import "server-only";

import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME, CUSTOMER_COOKIE_NAME, verifyAuthToken } from "./auth-tokens";

export interface CurrentCustomer {
  id: number;
  email: string;
  password_set_by_user: boolean;
}

export interface CurrentAdmin {
  id: number;
  email: string;
  role: string;
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  // In some Next.js versions with server actions enabled, cookies() is async and returns a Promise.
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== "customer") {
    return null;
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
    password_set_by_user: payload.password_set_by_user ?? false,
  };
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== "admin") {
    return null;
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
    role: payload.role,
  };
}


