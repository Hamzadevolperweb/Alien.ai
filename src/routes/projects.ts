import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/projects", requireAuth);
router.post("/projects", requireAuth);
router.get("/projects/:id", requireAuth);
router.patch("/projects/:id", requireAuth);
router.delete("/projects/:id", requireAuth);

export default router;
