import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";
import { ApiError } from "../errors.js";

const router = Router();
const bodySchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
  project_type: z.string().trim().max(50).default("general"),
});

router.get("/projects", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("projects").select("*")
      .eq("user_id", req.authUser!.id).order("updated_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.post("/projects", requireAuth, async (req, res, next) => {
  try {
    const body = bodySchema.parse(req.body);
    const { data, error } = await adminSupabase().from("projects").insert({
      ...body, user_id: req.authUser!.id,
    }).select("*").single();
    if (error) throw error;
    res.status(201).json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.get("/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase().from("projects").select("*")
      .eq("id", req.params.id).eq("user_id", req.authUser!.id).maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "NOT_FOUND", "Project not found.");
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.patch("/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const body = bodySchema.partial().parse(req.body);
    const { data, error } = await adminSupabase().from("projects").update(body)
      .eq("id", req.params.id).eq("user_id", req.authUser!.id).select("*").maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "NOT_FOUND", "Project not found.");
    res.json({ success: true, data, error: null });
  } catch (error) { next(error); }
});

router.delete("/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await adminSupabase().from("projects").delete()
      .eq("id", req.params.id).eq("user_id", req.authUser!.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
