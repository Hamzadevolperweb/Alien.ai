import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";
import { config } from "../config.js";
import { ApiError, configError } from "../errors.js";
import { generateImage } from "../providers/image.js";
import { createRunwayTask, getRunwayTask } from "../providers/video.js";

const router = Router();
const imageSchema = z.object({
  project_id: z.string().uuid().optional(),
  prompt: z.string().trim().min(1).max(4000),
  negative_prompt: z.string().trim().max(4000).optional(),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536", "auto"]).optional(),
  quality: z.enum(["low", "medium", "high", "auto"]).optional(),
  idempotency_key: z.string().trim().min(1).max(100).optional(),
});
const videoSchema = z.object({
  project_id: z.string().uuid().optional(),
  prompt: z.string().trim().min(1).max(4000),
  image_uri: z.string().url().optional(),
  ratio: z.enum(["1280:720", "720:1280", "1104:832", "832:1104"]).optional(),
  duration: z.union([z.literal(5), z.literal(10)]).optional(),
  idempotency_key: z.string().trim().min(1).max(100).optional(),
});

async function reserveCredits(userId: string, amount: number, generationId: string, key: string) {
  const { data, error } = await adminSupabase().rpc("reserve_generation_credits", {
    p_user_id: userId, p_amount: amount, p_generation_id: generationId, p_idempotency_key: key,
  });
  if (error) throw error;
  if (!data) throw new ApiError(402, "INSUFFICIENT_CREDITS", "The credit balance is insufficient.");
}

async function storeGeneration(userId: string, media: Buffer, mime: string, generationId: string) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) throw configError("Supabase storage");
  const extension = mime.includes("png") ? "png" : mime.includes("jpeg") ? "jpg" : "bin";
  const path = `${userId}/${generationId}.${extension}`;
  const supabase = adminSupabase();
  const { error } = await supabase.storage.from(config.storageBucket).upload(path, media, {
    contentType: mime, upsert: false,
  });
  if (error) throw error;
  return path;
}

router.post("/generations/image", requireAuth, async (req, res, next) => {
  try {
    const body = imageSchema.parse(req.body);
    const key = body.idempotency_key ?? crypto.randomUUID();
    const { data: existing } = await adminSupabase().from("generations")
      .select("*").eq("idempotency_key", key).eq("user_id", req.authUser!.id).maybeSingle();
    if (existing) {
      res.status(200).json({ success: true, data: existing, error: null });
      return;
    }

    const { data: generation, error } = await adminSupabase().from("generations").insert({
      user_id: req.authUser!.id, project_id: body.project_id ?? null,
      provider: "openai", model: config.openAiImageModel, generation_type: "image",
      prompt: body.prompt, negative_prompt: body.negative_prompt ?? null, status: "queued",
      aspect_ratio: body.size ?? "1024x1024", credits_used: config.imageCreditCost,
      idempotency_key: key,
    }).select("*").single();
    if (error) throw error;
    await reserveCredits(req.authUser!.id, config.imageCreditCost, generation.id, key);
    await adminSupabase().from("generations").update({ status: "processing" }).eq("id", generation.id);

    const result = await generateImage({ prompt: body.prompt, size: body.size, quality: body.quality });
    let outputPath: string;
    if (result.base64) {
      outputPath = await storeGeneration(req.authUser!.id, Buffer.from(result.base64, "base64"), "image/png", generation.id);
    } else if (result.url) {
      const download = await fetch(result.url);
      if (!download.ok) throw new ApiError(502, "PROVIDER_ERROR", "Could not download the generated image.");
      const bytes = Buffer.from(await download.arrayBuffer());
      outputPath = await storeGeneration(req.authUser!.id, bytes, download.headers.get("content-type") ?? "image/png", generation.id);
    } else {
      throw new ApiError(502, "PROVIDER_ERROR", "The provider returned no image.");
    }
    const { data: completed, error: updateError } = await adminSupabase().from("generations").update({
      status: "completed", output_media_path: outputPath, completed_at: new Date().toISOString(),
    }).eq("id", generation.id).select("*").single();
    if (updateError) throw updateError;
    await adminSupabase().from("generation_assets").insert({
      generation_id: generation.id, user_id: req.authUser!.id, asset_type: "output_image",
      storage_path: outputPath, mime_type: result.base64 ? "image/png" : "image/png",
    }).select("*").maybeSingle();
    res.status(201).json({ success: true, data: completed, error: null });
  } catch (error) { next(error); }
});

async function createVideo(req: Parameters<typeof requireAuth>[0], res: import("express").Response, next: import("express").NextFunction, type: "video" | "image-to-video") {
  try {
    const body = videoSchema.parse(req.body);
    if (type === "image-to-video" && !body.image_uri) {
      throw new ApiError(400, "VALIDATION_ERROR", "image_uri is required for image-to-video.");
    }
    const key = body.idempotency_key ?? crypto.randomUUID();
    const { data: existing } = await adminSupabase().from("generations").select("*")
      .eq("idempotency_key", key).eq("user_id", req.authUser!.id).maybeSingle();
    if (existing) { res.status(200).json({ success: true, data: existing, error: null }); return; }

    const { data: generation, error } = await adminSupabase().from("generations").insert({
      user_id: req.authUser!.id, project_id: body.project_id ?? null, provider: "runway",
      model: config.runwayVideoModel, generation_type: type, prompt: body.prompt,
      status: "queued", input_media_path: body.image_uri ?? null,
      aspect_ratio: body.ratio ?? null, duration_seconds: body.duration ?? null,
      credits_used: config.videoCreditCost, idempotency_key: key,
    }).select("*").single();
    if (error) throw error;
    await reserveCredits(req.authUser!.id, config.videoCreditCost, generation.id, key);
    const task = await createRunwayTask({ prompt: body.prompt, imageUri: body.image_uri, ratio: body.ratio, duration: body.duration });
    const { data: queued, error: updateError } = await adminSupabase().from("generations").update({
      provider_job_id: task.id, status: "processing",
    }).eq("id", generation.id).select("*").single();
    if (updateError) throw updateError;
    res.status(202).json({ success: true, data: queued, error: null });
  } catch (error) { next(error); }
}

router.post("/generations/video", requireAuth, (req, res, next) => createVideo(req, res, next, "video"));
router.post("/generations/image-to-video", requireAuth, (req, res, next) => createVideo(req, res, next, "image-to-video"));
router.post("/generations/video/text", requireAuth, (req, res, next) => createVideo(req, res, next, "video"));
router.post("/generations/video/image", requireAuth, (req, res, next) => createVideo(req, res, next, "image-to-video"));

router.get("/generations", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("generations").select("*")
      .eq("user_id", req.authUser!.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.get("/generations/:id", requireAuth, async (req, res, next) => {
  try {
    const supabase = adminSupabase();
    const { data: generation, error } = await supabase.from("generations").select("*")
      .eq("id", req.params.id).eq("user_id", req.authUser!.id).maybeSingle();
    if (error) throw error;
    if (!generation) throw new ApiError(404, "NOT_FOUND", "Generation not found.");

    if (generation.provider_job_id && ["queued", "processing"].includes(generation.status)) {
      const task = await getRunwayTask(generation.provider_job_id);
      const providerStatus = task.status.toUpperCase();
      if (["SUCCEEDED", "COMPLETED"].includes(providerStatus)) {
        let outputPath: string | null = null;
        let outputUrl = task.output?.[0] ?? null;
        if (outputUrl) {
          try {
            const download = await fetch(outputUrl);
            if (!download.ok) throw new Error("Provider output download failed.");
            const bytes = Buffer.from(await download.arrayBuffer());
            outputPath = `${generation.user_id}/${generation.id}.mp4`;
            const { error: uploadError } = await supabase.storage.from(config.storageBucket)
              .upload(outputPath, bytes, { contentType: "video/mp4", upsert: true });
            if (uploadError) throw uploadError;
            outputUrl = null;
          } catch (storageError) {
            console.error("Could not persist completed video output:", storageError instanceof Error ? storageError.message : storageError);
          }
        }
        await supabase.from("generations").update({
          status: "completed", output_media_path: outputPath, output_url: outputUrl,
          completed_at: new Date().toISOString(),
        }).eq("id", generation.id);
      } else if (["FAILED", "CANCELLED"].includes(providerStatus)) {
        await supabase.from("generations").update({
          status: "failed", error_message: task.failure ?? "The provider task failed.",
          completed_at: new Date().toISOString(),
        }).eq("id", generation.id);
        await supabase.rpc("refund_generation_credits", { p_generation_id: generation.id });
      }
      const { data: refreshed } = await supabase.from("generations").select("*").eq("id", generation.id).single();
      res.json({ success: true, data: refreshed, error: null });
      return;
    }
    res.json({ success: true, data: generation, error: null });
  } catch (error) { next(error); }
});

router.get("/generations/image/:id", requireAuth, async (req, res, next) => {
  const statusHandler = router.stack.find((layer) => layer.route?.path === "/generations/:id");
  if (!statusHandler?.route) {
    next(new ApiError(500, "INTERNAL_ERROR", "Generation status route is unavailable."));
    return;
  }
  const handler = statusHandler.route.stack.at(-1)?.handle;
  handler?.(req, res, next);
});

router.get("/generations/video/:id", requireAuth, async (req, res, next) => {
  const statusHandler = router.stack.find((layer) => layer.route?.path === "/generations/:id");
  if (!statusHandler?.route) {
    next(new ApiError(500, "INTERNAL_ERROR", "Generation status route is unavailable."));
    return;
  }
  const handler = statusHandler.route.stack.at(-1)?.handle;
  handler?.(req, res, next);
});

router.delete("/generations/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await adminSupabase().from("generations").delete()
      .eq("id", req.params.id).eq("user_id", req.authUser!.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
