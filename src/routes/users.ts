import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/user/profile", requireAuth);
router.get("/user/credits", requireAuth);
router.get("/user/usage", requireAuth);

export default router;
