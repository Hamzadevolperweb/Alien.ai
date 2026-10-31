import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config, requireSupabaseConfig } from "../config.js";
import { ApiError } from "../errors.js";

export function adminSupabase(): SupabaseClient {
  requireSupabaseConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicSupabase(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new ApiError(503, "CONFIGURATION_ERROR", "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured.");
  }
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
