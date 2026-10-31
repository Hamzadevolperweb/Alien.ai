import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase, publicSupabase } from "../lib/supabase.js";

const router = Router();

router.post("/auth/register", async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().email().max(320),
      password: z.string().min(8).max(128),
      display_name: z.string().trim().min(1).max(100).optional(),
    }).parse(req.body);
    const { data, error } = await publicSupabase().auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: body.display_name ? { display_name: body.display_name } : undefined },
    });
    if (error) throw error;
    res.status(201).json({
      success: true,
      data: { user: data.user, session: data.session },
      error: null,
    });
  } catch (error) { next(error); }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(req.body);
    const { data, error } = await publicSupabase().auth.signInWithPassword(body);
    if (error) throw error;
    res.json({ success: true, data: { user: data.user, session: data.session }, error: null });
  } catch (error) { next(error); }
});

router.post("/auth/logout", requireAuth, async (req, res, next) => {
  try {
    const token = req.header("authorization")!.slice(7);
    const { error } = await publicSupabase().auth.admin.signOut(token, "global");
    if (error) throw error;
    res.json({ success: true, data: { logged_out: true }, error: null });
  } catch (error) { next(error); }
});

router.post("/auth/password-reset", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), redirect_to: z.string().url().optional() }).parse(req.body);
    const { error } = await publicSupabase().auth.resetPasswordForEmail(body.email, {
      redirectTo: body.redirect_to,
    });
    if (error) throw error;
    res.json({ success: true, data: { sent: true }, error: null });
  } catch (error) { next(error); }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ success: true, data: req.authUser, error: null });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await adminSupabase()
      .from("profiles")
      .select("*")
      .eq("id", req.authUser!.id)
      .maybeSingle();
    if (error) throw error;
    res.json({
      success: true,
      data: { id: req.authUser!.id, email: req.authUser!.email ?? null, profile: data ?? null },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      display_name: z.string().trim().min(1).max(100).optional(),
      avatar_url: z.string().url().max(2048).nullable().optional(),
    }).parse(req.body);
    const { data, error } = await adminSupabase()
      .from("profiles")
      .upsert({ id: req.authUser!.id, ...body }, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    res.json({ success: true, data, error: null });
  } catch (error) {
    next(error);
  }
});

router.post("/account/delete", requireAuth, async (req, res, next) => {
  try {
    const { error } = await adminSupabase().auth.admin.deleteUser(req.authUser!.id);
    if (error) throw error;
    res.json({ success: true, data: { deleted: true }, error: null });
  } catch (error) {
    next(error);
  }
});

export default router;
