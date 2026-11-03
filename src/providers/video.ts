import { config } from "../config.js";
import { ApiError, configError } from "../errors.js";

export interface VideoRequest {
  prompt: string;
  imageUri?: string;
  ratio?: string;
  duration?: number;
}

interface ProviderError {
  error?: string;
  message?: string;
  code?: string;
}

function providerError(response: globalThis.Response, bodyText: string, fallback: string): ApiError {
  let body: ProviderError = {};
  try {
    body = JSON.parse(bodyText) as ProviderError;
  } catch {
    // Runway may return a non-JSON error for upstream failures.
  }
  if (response.status === 401 || response.status === 403) {
    return new ApiError(502, "PROVIDER_AUTH_ERROR", "Runway authentication failed. Check RUNWAY_API_KEY.");
  }
  if (response.status === 429) {
    return new ApiError(429, "PROVIDER_RATE_LIMIT", "Runway rate limit or credits limit reached. Check your Runway account.");
  }
  return new ApiError(502, "PROVIDER_ERROR", body.error ?? body.message ?? fallback);
}

export async function createRunwayTask(input: VideoRequest): Promise<{ id: string; status: string }> {
  if (!config.runwayKey) throw configError("RUNWAY_API_KEY");
  if (!config.runwayVideoModel) {
    throw new ApiError(503, "CONFIGURATION_ERROR", "RUNWAY_VIDEO_MODEL is not configured.");
  }

  const model = input.imageUri && config.runwayVideoModel === "gen4.5" ? "gen4_turbo" : config.runwayVideoModel;
  const body: Record<string, unknown> = {
    model,
    promptText: input.prompt,
    ratio: input.ratio ?? "1280:720",
  };
  if (input.imageUri) body.promptImage = input.imageUri;
  if (input.duration) body.duration = input.duration;

  const endpoint = input.imageUri ? "image_to_video" : "text_to_video";
  let response: globalThis.Response;
  try {
    response = await fetch(`https://api.dev.runwayml.com/v1/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.runwayKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(502, "PROVIDER_UNAVAILABLE", error instanceof Error
      ? `Runway request failed: ${error.message}`
      : "Runway request failed.");
  }

  const responseText = await response.text();
  let result: { id?: string; status?: string };
  try {
    result = JSON.parse(responseText) as { id?: string; status?: string };
  } catch {
    throw new ApiError(502, "PROVIDER_ERROR", "Runway returned an invalid response.");
  }
  if (!response.ok || !result.id) {
    throw providerError(response, responseText, "The video provider rejected the request.");
  }
  return { id: result.id, status: result.status ?? "PENDING" };
}

export async function getRunwayTask(id: string): Promise<{ status: string; output?: string[]; failure?: string; failureCode?: string }> {
  if (!config.runwayKey) throw configError("RUNWAY_API_KEY");

  let response: globalThis.Response;
  try {
    response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${config.runwayKey}`,
        "X-Runway-Version": "2024-11-06",
      },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new ApiError(502, "PROVIDER_UNAVAILABLE", error instanceof Error
      ? `Runway request failed: ${error.message}`
      : "Runway request failed.");
  }

  const responseText = await response.text();
  let result: { status?: string; output?: string[]; failure?: string; failureCode?: string };
  try {
    result = JSON.parse(responseText) as typeof result;
  } catch {
    throw new ApiError(502, "PROVIDER_ERROR", "Runway returned an invalid response.");
  }
  if (!response.ok) {
    throw providerError(response, responseText, "Could not retrieve the video provider task.");
  }
  return { status: result.status ?? "PENDING", output: result.output, failure: result.failure, failureCode: result.failureCode };
}
