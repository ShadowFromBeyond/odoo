import { Router } from "express";
import { publicTrip } from "../controllers/tripController.js";

export const publicRoutes = Router();

publicRoutes.get("/:slug", publicTrip);
