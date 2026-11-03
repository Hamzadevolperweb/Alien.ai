import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ApiError } from "../errors.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import { createDemoSession, DEMO_SESSION_COOKIE, DEMO_SESSION_MAX_AGE_MS } from "../lib/demo-auth.js";

const router = Router();
const databaseUnavailable = (_req: import("express").Request, _res: import("express").Response, next: import("express").NextFunction) =>
  next(new ApiError(401, "AUTHENTICATION_REQUIRED", "Sign in again to continue."));

const demoLoginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/auth/register", databaseUnavailable);
router.get("/auth/demo-info", (_req, res, next) => {
  if (!config.demoAuthEnabled) {
    next(new ApiError(503, "DEMO_AUTH_DISABLED", "Demo authentication is disabled."));
    return;
  }
  res.json({
    success: true,
    data: { enabled: true, email: "Haris", password: "any non-empty password" },
    error: null,
  });
});
const demoLogin = (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
  if (!config.demoAuthEnabled) {
    next(new ApiError(503, "DEMO_AUTH_DISABLED", "Demo authentication is disabled."));
    return;
  }
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim()
    : typeof req.body?.username === "string"
      ? req.body.username.trim()
      : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email) {
    next(new ApiError(400, "INVALID_USERNAME", "Enter a username."));
    return;
  }
  if (!password.trim()) {
    next(new ApiError(400, "INVALID_PASSWORD", "Enter a password."));
    return;
  }
  const user = { id: "demo-user", email, display_name: "Demo User" };
  const token = createDemoSession(config.demoAuthSecret, user);
  res.cookie(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: DEMO_SESSION_MAX_AGE_MS,
    path: "/",
  });
  res.json({ success: true, data: { user }, error: null });
};
router.post("/auth/demo/login", demoLoginLimiter, demoLogin);
router.post("/auth/demo/resume", (req, res, next) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  if (!username) {
    next(new ApiError(400, "INVALID_USERNAME", "Enter a username."));
    return;
  }
  req.body = { ...req.body, email: username, password: "demo-session" };
  demoLogin(req, res, next);
});
router.post("/auth/login", demoLoginLimiter, (req, res, next) => {
  if (!config.demoAuthEnabled) {
    databaseUnavailable(req, res, next);
    return;
  }
  demoLogin(req, res, next);
});
router.post("/auth/logout", (req, res) => {
  res.clearCookie(DEMO_SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: config.nodeEnv === "production", path: "/" });
  res.json({ success: true, data: { logged_out: true }, error: null });
});
router.post("/auth/password-reset", databaseUnavailable);
router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.authUser }, error: null });
});
router.get("/me", requireAuth);
router.patch("/me", requireAuth);
router.post("/account/delete", requireAuth);

export default router;
