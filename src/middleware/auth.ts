import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors.js";
import { config } from "../config.js";
import { readCookies, verifyDemoSession } from "../lib/demo-auth.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (config.demoAuthEnabled) {
    const token = readCookies(req)[config.demoAuthEnabled ? "alien_demo_session" : ""];
    const session = token ? verifyDemoSession(config.demoAuthSecret, token) : null;
    if (session) {
      req.authUser = session.user;
      next();
      return;
    }
  }
  next(new ApiError(401, "AUTHENTICATION_REQUIRED", "Sign in again to continue."));
}
