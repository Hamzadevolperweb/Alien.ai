import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";

const router = Router();

router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("generations").select("*")
      .eq("user_id", req.authUser!.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

export default router;
