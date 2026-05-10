import { Router } from "express";
import { activities, cities } from "../controllers/exploreController.js";

export const exploreRoutes = Router();

exploreRoutes.get("/cities", cities);
exploreRoutes.get("/activities", activities);
