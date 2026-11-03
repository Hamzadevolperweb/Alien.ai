import { config } from "../config.js";
import { ApiError } from "../errors.js";

const DEMO_STARTING_CREDITS = 1_000;
const balances = new Map<string, number>();
const chargedRequests = new Map<string, { taskId: string; balance: number }>();

export function demoCreditUserId(email: string): string {
  return email.trim().toLowerCase();
}

export function getDemoCredits(email: string): number {
  const userId = demoCreditUserId(email);
  if (!balances.has(userId)) balances.set(userId, DEMO_STARTING_CREDITS);
  return balances.get(userId) ?? DEMO_STARTING_CREDITS;
}

export function getDemoRequestCharge(email: string, requestId: string): { taskId: string; balance: number } | null {
  return chargedRequests.get(`${demoCreditUserId(email)}:${requestId}`) ?? null;
}

export function chargeDemoCredits(email: string, requestId: string, taskId: string): number {
  const userId = demoCreditUserId(email);
  const requestKey = `${userId}:${requestId}`;
  const previous = chargedRequests.get(requestKey);
  if (previous) return previous.balance;

  const cost = Math.max(0, Number.isFinite(config.videoCreditCost) ? config.videoCreditCost : 50);
  const balance = getDemoCredits(email);
  if (balance < cost) {
    throw new ApiError(
      402,
      "INSUFFICIENT_CREDITS",
      `You need ${cost} credits. Your demo balance is ${balance}.`,
    );
  }

  const remaining = balance - cost;
  balances.set(userId, remaining);
  chargedRequests.set(requestKey, { taskId, balance: remaining });
  return remaining;
}
