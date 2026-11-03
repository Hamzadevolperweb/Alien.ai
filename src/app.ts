import express from "express";
import path from "node:path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import apiRouter from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
const allowedOrigins = config.frontendUrl.split(",").map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api/generations", rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
}));
app.use("/api", apiRouter);
const frontendPath = path.resolve(process.cwd(), "frontend", "Alian.ai");
app.use(express.static(frontendPath));
app.get("/", (_req, res) => res.sendFile(path.join(frontendPath, "index.html")));
app.get(["/index.html", "/login.html", "/dashboard.html", "/info.html"], (req, res) =>
  res.sendFile(path.join(frontendPath, path.basename(req.path))));
app.use(notFound);
app.use(errorHandler);
