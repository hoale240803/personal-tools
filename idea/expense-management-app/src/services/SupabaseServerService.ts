import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_ENV_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_ENV_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

/**
 * Reads a required environment variable and throws when it is missing.
 *
 * @param envKey - Name of the environment variable to read.
 * @returns The non-empty environment variable value.
 */
function requireEnv(envKey: string): string {
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
  return value;
}

/**
 * Creates a Supabase server client bound to the current request cookies.
 * Used by API routes to authenticate the caller and enforce RLS.
 *
 * @returns A Supabase client scoped to the authenticated user session.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv(SUPABASE_URL_ENV_KEY),
    requireEnv(SUPABASE_ANON_KEY_ENV_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/**
 * Creates a Supabase admin client using the service-role key.
 * Bypasses RLS — intended for background/cron jobs in later phases.
 *
 * @returns A Supabase client with elevated privileges.
 */
export function createSupabaseServiceClient(): SupabaseClient {
  return createClient(
    requireEnv(SUPABASE_URL_ENV_KEY),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
