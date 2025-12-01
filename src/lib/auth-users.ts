import "server-only";

import bcrypt from "bcryptjs";

import { getSupabaseClient } from "./supabase-storage";

export interface CustomerRow {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminRow {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  role: string;
  created_at: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getCustomerByEmail(email: string): Promise<CustomerRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("customers")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle<CustomerRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getCustomerById(id: number): Promise<CustomerRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle<CustomerRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function createCustomer(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<CustomerRow> {
  const client = getSupabaseClient();
  const password_hash = await hashPassword(params.password);

  const { data, error } = await client
    .from("customers")
    .insert({
      email: params.email.toLowerCase(),
      password_hash,
      name: params.name ?? null,
    })
    .select("*")
    .maybeSingle<CustomerRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create customer");
  }

  return data;
}

export async function getAdminByEmail(email: string): Promise<AdminRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("admins")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle<AdminRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}


