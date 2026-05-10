import { Router } from "express";
import * as controller from "../controllers/transportController.js";

/**
 * Transport Provider Routes
 * All endpoints are read-only (GET only)
 * No authentication required (can be added if needed)
 */

export const transportRoutes = Router();

// Bus endpoints
transportRoutes.get("/buses/vehicles", controller.getBusVehicles);
transportRoutes.get("/buses/trips", controller.getBusTrips);
transportRoutes.get("/buses/alerts", controller.getBusAlerts);

// Flight endpoints
transportRoutes.get("/flights/status", controller.getFlightStatus);
transportRoutes.get("/flights/schedules", controller.getFlightSchedules);

// Train endpoints (stub)
transportRoutes.get("/trains/live", controller.getTrainLiveStatus);
transportRoutes.get("/trains/pnr", controller.getTrainPnrStatus);
transportRoutes.get("/trains/schedule", controller.getTrainSchedule);

// Provider info
transportRoutes.get("/providers/capabilities", controller.getProviderCapabilities);
