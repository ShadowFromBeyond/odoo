import { Router } from "express";
import { analytics } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const adminRoutes = Router();

adminRoutes.get("/analytics", requireAuth, analytics);
