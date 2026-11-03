import { createHmac, timingSafeEqual } from "node:crypto";
import { Request } from "express";

export const DEMO_SESSION_COOKIE = "alien_demo_session";
export const DEMO_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export interface DemoUser {
  id: string;
  email: string;
  display_name: string;
}

export interface DemoSession {
  mode: "demo";
  user: DemoUser;
  expiresAt: number;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createDemoSession(secret: string, user: DemoUser, now = Date.now()): string {
  const payload: DemoSession = {
    mode: "demo",
    user,
    expiresAt: now + DEMO_SESSION_MAX_AGE_MS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyDemoSession(secret: string, token: string, now = Date.now()): DemoSession | null {
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const encodedPayload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(decode(encodedPayload)) as DemoSession;
    if (
      payload.mode !== "demo" ||
      payload.expiresAt <= now ||
      payload.user?.id !== "demo-user" ||
      typeof payload.user.email !== "string" ||
      !payload.user.email.trim()
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readCookies(req: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of (req.headers.cookie ?? "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    cookies[pair.slice(0, separator).trim()] = decodeURIComponent(pair.slice(separator + 1).trim());
  }
  return cookies;
}

export function credentialsEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
