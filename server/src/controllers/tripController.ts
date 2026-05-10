import { Request, Response } from "express";
import { z } from "zod";
import * as trips from "../services/tripService.js";

export async function list(req: Request, res: Response) {
  res.json(await trips.listTrips(req.userId!));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await trips.createTrip(req.userId!, trips.tripSchema.parse(req.body)));
}

export async function detail(req: Request, res: Response) {
  const trip = await trips.getTrip(req.userId!, req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  return res.json(trip);
}

export async function update(req: Request, res: Response) {
  res.json(await trips.updateTrip(req.userId!, req.params.id, trips.tripSchema.partial().parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  await trips.deleteTrip(req.userId!, req.params.id);
  res.status(204).send();
}

export async function addStop(req: Request, res: Response) {
  res.status(201).json(await trips.addStop(req.params.id, trips.stopSchema.parse(req.body)));
}

export async function reorderStops(req: Request, res: Response) {
  const schema = z.array(z.object({ id: z.string(), orderIndex: z.number().int().nonnegative() }));
  res.json(await trips.reorderStops(req.params.id, schema.parse(req.body.order)));
}

export async function addActivity(req: Request, res: Response) {
  res.status(201).json(await trips.addActivity(trips.activitySchema.parse(req.body)));
}

export async function upsertBudget(req: Request, res: Response) {
  res.json(await trips.upsertBudget(req.params.id, trips.budgetSchema.parse(req.body)));
}

export async function addChecklist(req: Request, res: Response) {
  const body = z.object({ title: z.string().min(1), category: z.string().min(1) }).parse(req.body);
  res.status(201).json(await trips.addChecklistItem(req.params.id, body));
}

export async function updateChecklist(req: Request, res: Response) {
  const body = z.object({ title: z.string().optional(), category: z.string().optional(), packed: z.boolean().optional() }).parse(req.body);
  res.json(await trips.updateChecklistItem(req.params.itemId, body));
}

export async function deleteChecklist(req: Request, res: Response) {
  await trips.deleteChecklistItem(req.params.itemId);
  res.status(204).send();
}

export async function addNote(req: Request, res: Response) {
  const body = z.object({ content: z.string().min(1), day: z.string().optional() }).parse(req.body);
  res.status(201).json(await trips.addNote(req.params.id, body));
}

export async function updateNote(req: Request, res: Response) {
  const body = z.object({ content: z.string().min(1), day: z.string().optional() }).parse(req.body);
  res.json(await trips.updateNote(req.params.noteId, body));
}

export async function deleteNote(req: Request, res: Response) {
  await trips.deleteNote(req.params.noteId);
  res.status(204).send();
}

export async function share(req: Request, res: Response) {
  res.json(await trips.shareTrip(req.userId!, req.params.id));
}

export async function publicTrip(req: Request, res: Response) {
  const shared = await trips.getPublicTrip(req.params.slug);
  if (!shared) return res.status(404).json({ message: "Public itinerary not found" });
  return res.json(shared);
}
