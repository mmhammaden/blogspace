import "dotenv/config";
import express, { NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import commentRoutes from "./routes/comment.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// If running behind a proxy (Heroku, Vercel), trust proxy for secure cookies
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Basic rate limiting to mitigate brute-force / DoS during development
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1", commentRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: NextFunction) => {
  const status = err?.status || 500;
  const body: any = { message: err?.message || "Internal server error" };
  if (process.env.NODE_ENV === "development") {
    // include stack in development for debugging
    body.stack = err?.stack;
    console.error(err);
  } else {
    // in production, avoid leaking internals
    console.error(err?.message || err);
  }
  res.status(status).json(body);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 BlogSpace API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
