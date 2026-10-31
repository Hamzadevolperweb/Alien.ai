import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";
import { config } from "../config.js";

const router = Router();

router.get("/credits", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("credit_accounts").select("*")
      .eq("user_id", req.authUser!.id).maybeSingle();
    if (error) throw error;
    res.json({ success: true, data: data ?? { user_id: req.authUser!.id, balance: 0 }, error: null });
  } catch (error) { next(error); }
});

router.get("/credits/transactions", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("credit_transactions").select("*")
      .eq("user_id", req.authUser!.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.get("/credits/estimate", async (req, res) => {
  const query = z.object({ type: z.enum(["image", "video", "image-to-video"]) }).safeParse(req.query);
  if (!query.success) {
    res.status(400).json({
      success: false, data: null,
      error: { code: "VALIDATION_ERROR", message: "type must be image, video, or image-to-video." },
    });
    return;
  }
  res.json({
    success: true,
    data: { type: query.data.type, credits: query.data.type === "image" ? config.imageCreditCost : config.videoCreditCost },
    error: null,
  });
});

export default router;
