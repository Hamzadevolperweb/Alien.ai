import { config } from "../config.js";
import { ApiError, configError } from "../errors.js";

export interface VideoRequest {
  prompt: string;
  imageUri?: string;
  ratio?: string;
  duration?: number;
}

export async function createRunwayTask(input: VideoRequest): Promise<{ id: string; status: string }> {
  if (!config.runwayKey) throw configError("RUNWAY_API_KEY");
  if (!config.runwayVideoModel) {
    throw new ApiError(503, "CONFIGURATION_ERROR", "RUNWAY_VIDEO_MODEL is not configured.");
  }
  const body: Record<string, unknown> = {
    model: config.runwayVideoModel,
    promptText: input.prompt,
    ratio: input.ratio ?? "1280:720",
  };
  if (input.imageUri) body.promptImage = input.imageUri;
  if (input.duration) body.duration = input.duration;

  const endpoint = input.imageUri ? "image_to_video" : "text_to_video";
  const response = await fetch(`https://api.dev.runwayml.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.runwayKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify(body),
  });
  const result = await response.json() as { id?: string; status?: string; error?: string };
  if (!response.ok || !result.id) {
    throw new ApiError(response.status === 429 ? 429 : 502, "PROVIDER_ERROR",
      result.error ?? "The video provider rejected the request.");
  }
  return { id: result.id, status: result.status ?? "PENDING" };
}

export async function getRunwayTask(id: string): Promise<{ status: string; output?: string[]; failure?: string }> {
  if (!config.runwayKey) throw configError("RUNWAY_API_KEY");
  const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${config.runwayKey}`,
      "X-Runway-Version": "2024-11-06",
    },
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json() as { status?: string; output?: string[]; failure?: string };
  if (!response.ok) throw new ApiError(502, "PROVIDER_ERROR", "Could not retrieve the video provider task.");
  return { status: result.status ?? "PENDING", output: result.output, failure: result.failure };
}
