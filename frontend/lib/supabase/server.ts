import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

// Server-side only Supabase client
// Uses service role key - NO RLS
export function createServerSupabaseClient(): TypedSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton for reuse
let supabaseInstance: TypedSupabaseClient | null = null;

export function getSupabase(): TypedSupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createServerSupabaseClient();
  }
  return supabaseInstance;
}
