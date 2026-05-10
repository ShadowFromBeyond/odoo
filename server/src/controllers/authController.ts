import { NextFunction, Request, Response } from "express";
import { getCurrentUser, loginSchema, loginUser, registerSchema, registerUser } from "../services/authService.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUser(registerSchema.parse(req.body));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(loginSchema.parse(req.body));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser(req.userId!);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
