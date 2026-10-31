import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "alien-ai-media",
  openAiKey: process.env.OPENAI_API_KEY ?? "",
  openAiImageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  runwayKey: process.env.RUNWAY_API_KEY ?? "",
  runwayVideoModel: process.env.RUNWAY_VIDEO_MODEL ?? "",
  imageCreditCost: Number(process.env.IMAGE_CREDIT_COST ?? 10),
  videoCreditCost: Number(process.env.VIDEO_CREDIT_COST ?? 50),
};

export function requireSupabaseConfig(): void {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured.");
  }
}
