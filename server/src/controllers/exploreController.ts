import { Request, Response } from "express";
import { searchActivities, searchCities } from "../services/exploreService.js";

export function cities(req: Request, res: Response) {
  res.json(searchCities(String(req.query.q ?? ""), String(req.query.tag ?? "")));
}

export function activities(req: Request, res: Response) {
  res.json(searchActivities(String(req.query.q ?? ""), String(req.query.category ?? "")));
}
