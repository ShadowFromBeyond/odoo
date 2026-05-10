import { Router } from "express";
import * as controller from "../controllers/tripController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const tripRoutes = Router();

tripRoutes.use(requireAuth);
tripRoutes.get("/", controller.list);
tripRoutes.post("/", controller.create);
tripRoutes.get("/:id", controller.detail);
tripRoutes.put("/:id", controller.update);
tripRoutes.delete("/:id", controller.remove);
tripRoutes.post("/:id/stops", controller.addStop);
tripRoutes.put("/:id/stops/reorder", controller.reorderStops);
tripRoutes.post("/:id/activities", controller.addActivity);
tripRoutes.put("/:id/budget", controller.upsertBudget);
tripRoutes.post("/:id/checklist", controller.addChecklist);
tripRoutes.patch("/:id/checklist/:itemId", controller.updateChecklist);
tripRoutes.delete("/:id/checklist/:itemId", controller.deleteChecklist);
tripRoutes.post("/:id/notes", controller.addNote);
tripRoutes.put("/:id/notes/:noteId", controller.updateNote);
tripRoutes.delete("/:id/notes/:noteId", controller.deleteNote);
tripRoutes.post("/:id/share", controller.share);
