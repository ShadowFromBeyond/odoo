import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: error.flatten() });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return res.status(500).json({ message });
}
