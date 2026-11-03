import { Router } from "express";
import authRouter from "./auth.js";
import projectsRouter from "./projects.js";
import generationsRouter from "./generations.js";
import uploadsRouter from "./uploads.js";
import creditsRouter from "./credits.js";
import usersRouter from "./users.js";
import historyRouter from "./history.js";
import { config } from "../config.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/config/supabase", (_req, res) => {
  res.json({
    success: true,
    data: {
      url: config.supabaseUrl || null,
      publishableKeyConfigured: Boolean(config.supabasePublishableKey),
    },
    error: null,
  });
});

router.get("/health", async (_req, res) => {
  const dependencies: { database: "ok" | "error" | "not_configured"; openai: "ok" | "error" | "not_configured"; runway: "ok" | "not_configured" } = {
    database: "not_configured",
    openai: config.openAiKey ? "error" : "not_configured",
    runway: config.runwayKey && config.runwayVideoModel ? "ok" : "not_configured",
  };
  if (config.openAiKey) {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${config.openAiKey}` },
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    if (response?.ok) dependencies.openai = "ok";
  }
  if (config.supabaseUrl && config.supabaseSecretKey) {
    try {
      const { error } = await getSupabaseAdmin()
        .from("video_generations")
        .select("id")
        .limit(1);
      dependencies.database = error ? "error" : "ok";
    } catch {
      dependencies.database = "error";
    }
  }

  const status = "ok";
  res.status(200).json({
    success: true,
    data: { status, dependencies },
    error: status === "ok" ? null : { code: "DEPENDENCY_UNAVAILABLE", message: "One or more required dependencies are unavailable." },
  });
});
router.use(authRouter, projectsRouter, generationsRouter, uploadsRouter, creditsRouter, usersRouter, historyRouter);

export default router;
