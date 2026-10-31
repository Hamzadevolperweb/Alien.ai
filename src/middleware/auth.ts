import { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { ApiError } from "../errors.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!config.supabaseUrl || !config.supabasePublishableKey) {
      throw new ApiError(503, "CONFIGURATION_ERROR", "Supabase authentication is not configured.");
    }
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "A bearer access token is required.");
    }
    const token = header.slice("Bearer ".length);
    const client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      throw new ApiError(401, "UNAUTHORIZED", "The access token is invalid or expired.");
    }
    req.authUser = { id: data.user.id, email: data.user.email };
    next();
  } catch (error) {
    next(error);
  }
}
