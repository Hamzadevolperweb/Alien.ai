import { config } from "../config.js";
import { ApiError, configError } from "../errors.js";

export interface ImageRequest {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  quality?: "low" | "medium" | "high" | "auto";
}

export async function generateImage(input: ImageRequest): Promise<{ url?: string; base64?: string }> {
  if (!config.openAiKey) throw configError("OPENAI_API_KEY");
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openAiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: config.openAiImageModel,
      prompt: input.prompt,
      size: input.size ?? "1024x1024",
      quality: input.quality ?? "medium",
      n: 1,
    }),
  });
  const result = await response.json() as { data?: Array<{ url?: string; b64_json?: string }>; error?: { message?: string } };
  if (!response.ok) {
    throw new ApiError(response.status === 429 ? 429 : 502, "PROVIDER_ERROR",
      result.error?.message ?? "The image provider rejected the request.");
  }
  const item = result.data?.[0];
  if (!item) throw new ApiError(502, "PROVIDER_ERROR", "The image provider returned no image.");
  return { url: item.url, base64: item.b64_json };
}
