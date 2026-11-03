import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../errors.js";
import { createRunwayTask, getRunwayTask } from "../providers/video.js";
import { getDemoAsset } from "../lib/demo-assets.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { chargeDemoCredits, getDemoCredits, getDemoRequestCharge } from "../lib/demo-credits.js";
import { config } from "../config.js";

const router = Router();
const tasks = new Map<string, { providerId: string; status: string }>();

router.post("/generations/image", requireAuth);
router.post("/generations/video", requireAuth, async (req, res, next) => {
  try {
    const demoUser = req.authUser?.email ?? req.authUser?.id ?? "";
    const requestId = typeof req.body?.requestId === "string" ? req.body.requestId.trim() : "";
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (prompt.length < 3) throw new ApiError(400, "INVALID_PROMPT", "Enter a prompt of at least 3 characters.");
    const ratio = req.body?.ratio === "720:1280" ? "720:1280" : "1280:720";
    const duration = req.body?.duration === 10 ? 10 : 5;
    let imageUri: string | undefined;
    const assetId = typeof req.body?.imageAssetId === "string" ? req.body.imageAssetId : undefined;
    if (assetId) {
      const asset = getDemoAsset(assetId);
      if (!asset) throw new ApiError(404, "MEDIA_NOT_FOUND", "The attached image is no longer available.");
      imageUri = `data:${asset.mimeType};base64,${asset.buffer.toString("base64")}`;
    }
    if (getDemoCredits(demoUser) < config.videoCreditCost) {
      throw new ApiError(
        402,
        "INSUFFICIENT_CREDITS",
        `You need ${config.videoCreditCost} credits. Your demo balance is ${getDemoCredits(demoUser)}.`,
      );
    }
    if (requestId) {
      const existingCharge = getDemoRequestCharge(demoUser, requestId);
      if (existingCharge) {
        const existingTask = tasks.get(existingCharge.taskId);
        res.status(202).json({
          success: true,
          data: { id: existingCharge.taskId, status: existingTask?.status ?? "queued", credits_balance: existingCharge.balance },
          error: null,
        });
        return;
      }
    }
    const task = await createRunwayTask({ prompt, ratio, duration, imageUri });
    const creditsBalance = requestId
      ? chargeDemoCredits(demoUser, requestId, task.id)
      : Math.max(0, getDemoCredits(demoUser) - config.videoCreditCost);
    if (!requestId) chargeDemoCredits(demoUser, `provider:${task.id}`, task.id);
    tasks.set(task.id, { providerId: task.id, status: task.status });
    try {
      await getSupabaseAdmin().from("video_generations").insert({
        provider_task_id: task.id,
        demo_user_id: req.authUser?.email ?? req.authUser?.id ?? "",
        prompt,
        model: req.body?.model ?? "gen4.5",
        ratio,
        duration_seconds: duration,
        status: task.status.toLowerCase(),
      });
    } catch (error) {
      console.error("Could not persist generation history:", error instanceof Error ? error.message : "Unknown database error");
    }
    res.status(202).json({
      success: true,
      data: { id: task.id, status: task.status, credits_balance: creditsBalance },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});
router.post("/generations/image-to-video", requireAuth);
router.post("/generations/video/text", requireAuth);
router.post("/generations/video/image", requireAuth);
router.get("/generations/:id", requireAuth, async (req, res, next) => {
  try {
    const generationId = typeof req.params.id === "string" ? req.params.id : "";
    const local = tasks.get(generationId);
    if (!local) {
      next(new ApiError(404, "GENERATION_NOT_FOUND", "The generation task was not found."));
      return;
    }
    const task = await getRunwayTask(local.providerId);
    const status = task.status === "SUCCEEDED" ? "completed" : task.status === "FAILED" ? "failed" : task.status === "RUNNING" ? "processing" : "queued";
    try {
      await getSupabaseAdmin().from("video_generations").update({
        status,
        output_url: task.output?.[0] ?? null,
        failure: task.failure ?? null,
      }).eq("provider_task_id", local.providerId);
    } catch (error) {
      console.error("Could not update generation history:", error instanceof Error ? error.message : "Unknown database error");
    }
    res.json({
      success: true,
      data: {
        id: local.providerId,
        status,
        output_url: task.output?.[0],
        failure: task.failure,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/generations/image/:id", requireAuth);
router.get("/generations/video/:id", requireAuth);
router.delete("/generations/:id", requireAuth);

export default router;
