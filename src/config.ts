import "dotenv/config";
import { ApiError } from "./errors.js";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:4000",
  openAiKey: process.env.OPENAI_API_KEY ?? "",
  openAiImageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  runwayKey: process.env.RUNWAY_API_KEY ?? "",
  runwayVideoModel: process.env.RUNWAY_VIDEO_MODEL ?? "",
  imageCreditCost: Number(process.env.IMAGE_CREDIT_COST ?? 10),
  videoCreditCost: Number(process.env.VIDEO_CREDIT_COST ?? 50),
  supabaseUrl: (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, ""),
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
  demoAuthEnabled:
    (process.env.DEMO_AUTH_ENABLED === "true"
      || (process.env.DEMO_AUTH_ENABLED === undefined && (process.env.NODE_ENV ?? "development") !== "production"))
    && ((process.env.NODE_ENV ?? "development") !== "production" || Boolean(process.env.DEMO_AUTH_SECRET)),
  demoAuthEmail: process.env.DEMO_AUTH_EMAIL ?? "demo@alien.ai",
  demoAuthPassword: process.env.DEMO_AUTH_PASSWORD ?? "Demo@12345",
  demoAuthSecret: process.env.DEMO_AUTH_SECRET ?? "alien-ai-development-demo-secret",
};

export function requireSupabaseConfig(): void {
  if (!config.supabaseUrl || !config.supabaseSecretKey) {
    throw new ApiError(503, "DATABASE_NOT_CONFIGURED", "SUPABASE_URL or SUPABASE_SECRET_KEY is not configured.");
  }
}
