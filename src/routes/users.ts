import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";

const router = Router();

router.get("/user/profile", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("profiles").select("*")
      .eq("id", req.authUser!.id).maybeSingle();
    if (error) throw error;
    res.json({ success: true, data: data ?? { id: req.authUser!.id }, error: null });
  } catch (error) { next(error); }
});

router.get("/user/credits", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("credit_balances").select("*")
      .eq("user_id", req.authUser!.id).maybeSingle();
    if (error) throw error;
    res.json({ success: true, data: data ?? { user_id: req.authUser!.id, balance: 0 }, error: null });
  } catch (error) { next(error); }
});

router.get("/user/usage", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("credit_transactions").select("*")
      .eq("user_id", req.authUser!.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

export default router;
