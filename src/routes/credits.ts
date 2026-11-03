import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import { getDemoCredits } from "../lib/demo-credits.js";

const router = Router();

router.get("/credits", requireAuth, (req, res) => {
  const email = req.authUser?.email ?? req.authUser?.id ?? "";
  res.json({
    success: true,
    data: { balance: getDemoCredits(email), video_cost: config.videoCreditCost },
    error: null,
  });
});
router.get("/credits/transactions", requireAuth, (_req, res) => {
  res.json({ success: true, data: [], error: null });
});
router.get("/credits/estimate", requireAuth, (req, res) => {
  res.json({
    success: true,
    data: { credits: config.videoCreditCost, balance: getDemoCredits(req.authUser?.email ?? "") },
    error: null,
  });
});

export default router;
