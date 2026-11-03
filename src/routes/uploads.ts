import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import multer from "multer";
import { ApiError } from "../errors.js";
import { getDemoAsset, storeDemoAsset } from "../lib/demo-assets.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      callback(new ApiError(400, "INVALID_FILE", "Only JPEG, PNG, WebP, and GIF images are supported."));
      return;
    }
    callback(null, true);
  },
});

router.post("/uploads", requireAuth, upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    next(new ApiError(400, "FILE_REQUIRED", "Upload an image file."));
    return;
  }
  try {
    const supabase = getSupabaseAdmin();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "alien-ai-media";
    const objectName = `${req.authUser?.email ?? req.authUser?.id ?? "demo-user"}/${Date.now()}-${req.file.originalname}`;
    const uploaded = await supabase.storage.from(bucket).upload(objectName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (uploaded.error) throw uploaded.error;
    const signed = await supabase.storage.from(bucket).createSignedUrl(objectName, 3600);
    if (signed.error) throw signed.error;
    const asset = storeDemoAsset(req.file.originalname, req.file.mimetype, req.file.buffer);
    res.status(201).json({
      success: true,
      data: { id: asset.id, name: asset.name, mime_type: asset.mimeType, storage_path: uploaded.data.path, signed_url: signed.data.signedUrl },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});
router.delete("/uploads/*path", requireAuth);
router.get("/media/:id", requireAuth, (req, res, next) => {
  const mediaId = typeof req.params.id === "string" ? req.params.id : "";
  const asset = getDemoAsset(mediaId);
  if (!asset) {
    next(new ApiError(404, "MEDIA_NOT_FOUND", "The uploaded media was not found."));
    return;
  }
  res.type(asset.mimeType).send(asset.buffer);
});

export default router;
