import { Request, Response } from "express";
import { getCurrentUser, loginSchema, loginUser, registerSchema, registerUser } from "../services/authService.js";

export async function register(req: Request, res: Response) {
  const result = await registerUser(registerSchema.parse(req.body));
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(loginSchema.parse(req.body));
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.userId!);
  res.json({ user });
}
