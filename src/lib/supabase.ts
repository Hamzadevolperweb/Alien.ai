import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config, requireSupabaseConfig } from "../config.js";

export function adminSupabase(): SupabaseClient {
  requireSupabaseConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicSupabase(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured.");
  }
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
