import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { ApiError } from "../errors.js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!config.supabaseUrl) {
    throw new ApiError(503, "DATABASE_NOT_CONFIGURED", "SUPABASE_URL is not configured.");
  }
  let secret = config.supabaseSecretKey.trim().split(",")[0].trim();
  if (
    (secret.startsWith('"') && secret.endsWith('"'))
    || (secret.startsWith("'") && secret.endsWith("'"))
  ) {
    secret = secret.slice(1, -1).trim();
  } else if (secret.startsWith('"') || secret.startsWith("'")) {
    secret = secret.slice(1).trim();
  }
  if (!secret) {
    throw new ApiError(503, "DATABASE_NOT_CONFIGURED", "SUPABASE_SECRET_KEY is not configured.");
  }
  if (!secret.startsWith("eyJ") && !secret.startsWith("sb_secret_")) {
    throw new ApiError(503, "DATABASE_CONFIGURATION_INVALID", "SUPABASE_SECRET_KEY is not in a valid Supabase secret-key format.");
  }
  if (!adminClient) {
    adminClient = createClient(config.supabaseUrl, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
