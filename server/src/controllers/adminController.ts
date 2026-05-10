import { Request, Response } from "express";
import { getAnalytics } from "../services/adminService.js";

export function analytics(_req: Request, res: Response) {
  res.json(getAnalytics());
}
