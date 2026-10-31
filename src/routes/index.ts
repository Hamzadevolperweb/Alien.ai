import { Router } from "express";
import authRouter from "./auth.js";
import projectsRouter from "./projects.js";
import generationsRouter from "./generations.js";
import uploadsRouter from "./uploads.js";
import creditsRouter from "./credits.js";
import usersRouter from "./users.js";
import historyRouter from "./history.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" }, error: null });
});
router.use(authRouter, projectsRouter, generationsRouter, uploadsRouter, creditsRouter, usersRouter, historyRouter);

export default router;
