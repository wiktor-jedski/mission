import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type SupabaseServerConfig = {
  url: string;
  key: string;
};

export type SupabaseServerEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  [key: string]: string | undefined;
};

export const readSupabaseServerConfig = (
  source: SupabaseServerEnv
): SupabaseServerConfig => {
  const url = source.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = source.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!key) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { url, key };
};

export const createSupabaseServerClient = (
  source: SupabaseServerEnv = process.env
): SupabaseClient<Database> => {
  const config = readSupabaseServerConfig(source);
  return createClient<Database>(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
