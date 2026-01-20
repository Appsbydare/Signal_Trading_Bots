import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "app-data";
const SUPABASE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || (SUPABASE_PROJECT_ID ? `https://${SUPABASE_PROJECT_ID}.supabase.co` : undefined);

let supabaseClient: SupabaseClient | null = null;

function ensureConfig() {
  if (!SUPABASE_BASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase environment variables are not configured.");
  }
}

export function getSupabaseClient(): SupabaseClient {
  ensureConfig();

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_BASE_URL!, SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false },
    });
  }

  return supabaseClient;
}

export function getSupabasePublicUrl(path: string): string {
  ensureConfig();
  return `${SUPABASE_BASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

function isNotFound(error: { message?: string; statusCode?: string | number }): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() || "";
  return message.includes("not found") || error.statusCode === 404 || error.statusCode === "404";
}

export async function downloadTextFile(path: string): Promise<string | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(SUPABASE_BUCKET).download(path);

  if (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }

  const text = await data.text();
  return text;
}

export async function downloadBinaryFile(path: string): Promise<Buffer | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(SUPABASE_BUCKET).download(path);

  if (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function downloadJsonFile<T>(path: string): Promise<T | null> {
  const text = await downloadTextFile(path);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`Failed to parse JSON from ${path}`, error);
    throw error;
  }
}

export async function uploadTextFile(path: string, content: string, contentType = "application/json"): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(SUPABASE_BUCKET).upload(path, Buffer.from(content, "utf-8"), {
    cacheControl: "0",
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }
}

export async function uploadBinaryFile(path: string, data: Buffer, contentType: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(SUPABASE_BUCKET).upload(path, data, {
    cacheControl: "0",
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }
}

export async function deleteStorageObjects(paths: string[]): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(SUPABASE_BUCKET).remove(paths);

  if (error) {
    throw error;
  }
}

