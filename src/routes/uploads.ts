import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { adminSupabase } from "../lib/supabase.js";
import { config } from "../config.js";
import { ApiError } from "../errors.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new ApiError(400, "VALIDATION_ERROR", "Only JPEG, PNG, and WebP images are allowed."));
      return;
    }
    callback(null, true);
  },
});

function wildcardParam(value: string | string[]): string {
  return Array.isArray(value) ? value.join("/") : value;
}

router.post("/uploads", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "VALIDATION_ERROR", "A file is required.");
    const extension = extname(req.file.originalname).toLowerCase();
    const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(extension) ? extension : "";
    const path = `${req.authUser!.id}/${randomUUID()}${safeExtension}`;
    const { error } = await adminSupabase().storage.from(config.storageBucket).upload(path, req.file.buffer, {
      contentType: req.file.mimetype, upsert: false,
    });
    if (error) throw error;
    const { data, error: signedError } = await adminSupabase().storage.from(config.storageBucket)
      .createSignedUrl(path, 3600);
    if (signedError) throw signedError;
    res.status(201).json({ success: true, data: { path, signed_url: data.signedUrl }, error: null });
  } catch (error) { next(error); }
});

router.delete("/uploads/*path", requireAuth, async (req, res, next) => {
  try {
    const path = wildcardParam(req.params.path);
    if (!path.startsWith(`${req.authUser!.id}/`)) {
      throw new ApiError(403, "FORBIDDEN", "You cannot delete this upload.");
    }
    const { error } = await adminSupabase().storage.from(config.storageBucket).remove([path]);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { next(error); }
});

router.get("/media/*path", requireAuth, async (req, res, next) => {
  try {
    const path = wildcardParam(req.params.path);
    if (!path.startsWith(`${req.authUser!.id}/`)) {
      throw new ApiError(403, "FORBIDDEN", "You cannot access this media.");
    }
    const { data, error } = await adminSupabase().storage.from(config.storageBucket)
      .createSignedUrl(path, 3600);
    if (error) throw error;
    res.json({ success: true, data: { signed_url: data.signedUrl }, error: null });
  } catch (error) { next(error); }
});

export default router;
