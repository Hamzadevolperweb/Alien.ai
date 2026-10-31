import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors.js";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} was not found.` },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;
  if (error instanceof ApiError) {
    res.status(error.status).json({
      success: false,
      data: null,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Request validation failed.", details: error.flatten() },
    });
    return;
  }
  console.error(error);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  });
}
