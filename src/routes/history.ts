import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { ApiError } from "../errors.js";

const router = Router();

router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("video_generations")
      .select("*")
      .eq("demo_user_id", req.authUser?.email ?? req.authUser?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      if (error.code === "PGRST205") {
        throw new ApiError(503, "DATABASE_SCHEMA_MISSING", "The video_generations database table is not available.");
      }
      throw error;
    }
    res.json({ success: true, data: data ?? [], error: null });
  } catch (error) {
    next(error);
  }
});

export default router;
