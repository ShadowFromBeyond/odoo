import { z } from "zod";
import * as db from "../lib/db.js";

export const tripSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  coverImage: z.string().optional(),
  visibility: z.enum(["private", "public"]).default("private")
});

export const stopSchema = z.object({
  cityName: z.string().min(1),
  country: z.string().min(1),
  arrivalDate: z.string(),
  departureDate: z.string(),
  orderIndex: z.number().int().nonnegative()
});

export const activitySchema = z.object({
  stopId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  startTime: z.string().optional(),
  duration: z.number().int().positive()
});

export const budgetSchema = z.object({
  transportCost: z.number().nonnegative(),
  hotelCost: z.number().nonnegative(),
  activityCost: z.number().nonnegative(),
  mealCost: z.number().nonnegative(),
  miscellaneousCost: z.number().nonnegative()
});

export function listTrips(userId: string) {
  return db.listTripsByUser(userId);
}

export function getTrip(userId: string, id: string) {
  return db.getTripWithRelations(id, userId);
}

export function createTrip(userId: string, input: z.infer<typeof tripSchema>) {
  const trip = db.createTrip({
    userId,
    title: input.title,
    description: input.description ?? null,
    startDate: input.startDate,
    endDate: input.endDate,
    coverImage: input.coverImage ?? null,
    visibility: input.visibility
  });

  // Create default budget
  db.createBudget({
    tripId: trip.id,
    transportCost: 0,
    hotelCost: 0,
    activityCost: 0,
    mealCost: 0,
    miscellaneousCost: 0,
    totalCost: 0
  });

  return db.getTripWithRelations(trip.id, userId);
}

export function updateTrip(userId: string, id: string, input: Partial<z.infer<typeof tripSchema>>) {
  const trip = db.getTripByIdAndUser(id, userId);
  if (!trip) throw new Error("Trip not found");

  const data: Partial<z.infer<typeof tripSchema>> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage;
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;

  db.updateTrip(id, data);
  return db.getTripWithRelations(id, userId);
}

export async function deleteTrip(userId: string, id: string) {
  const trip = db.getTripByIdAndUser(id, userId);
  if (!trip) throw new Error("Trip not found");
  db.deleteTrip(id);
}

export function addStop(tripId: string, input: z.infer<typeof stopSchema>) {
  const stop = db.createTripStop({
    tripId,
    cityName: input.cityName,
    country: input.country,
    arrivalDate: input.arrivalDate,
    departureDate: input.departureDate,
    orderIndex: input.orderIndex
  });

  return {
    ...stop,
    activities: []
  };
}

export async function reorderStops(tripId: string, order: { id: string; orderIndex: number }[]) {
  const dbModule = await import("../lib/db.js");
  const database = dbModule.getDb();

  // Use transaction for atomic update
  const transaction = database.transaction((items: typeof order) => {
    for (const item of items) {
      db.updateTripStopOrder(tripId, item.id, item.orderIndex);
    }
  });

  transaction(order);

  return db.getTripStopsByTripId(tripId);
}

export function addActivity(input: z.infer<typeof activitySchema>) {
  return db.createActivity({
    stopId: input.stopId,
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    estimatedCost: input.estimatedCost,
    startTime: input.startTime ?? null,
    duration: input.duration
  });
}

export function upsertBudget(tripId: string, input: z.infer<typeof budgetSchema>) {
  const totalCost = input.transportCost + input.hotelCost + input.activityCost + input.mealCost + input.miscellaneousCost;
  return db.upsertBudget({
    tripId,
    transportCost: input.transportCost,
    hotelCost: input.hotelCost,
    activityCost: input.activityCost,
    mealCost: input.mealCost,
    miscellaneousCost: input.miscellaneousCost,
    totalCost
  });
}

export function addChecklistItem(tripId: string, input: { title: string; category: string }) {
  return db.createChecklistItem({
    tripId,
    title: input.title,
    category: input.category
  });
}

export function updateChecklistItem(id: string, input: { packed?: boolean; title?: string; category?: string }) {
  return db.updateChecklistItem(id, input);
}

export function deleteChecklistItem(id: string) {
  db.deleteChecklistItem(id);
}

export function addNote(tripId: string, input: { content: string; day?: string }) {
  return db.createTripNote({
    tripId,
    content: input.content,
    day: input.day ?? null
  });
}

export function updateNote(id: string, input: { content: string; day?: string }) {
  return db.updateTripNote(id, {
    content: input.content,
    day: input.day ?? null
  });
}

export function deleteNote(id: string) {
  db.deleteTripNote(id);
}

export async function shareTrip(userId: string, tripId: string) {
  const existing = db.getTripByIdAndUser(tripId, userId);
  if (!existing) throw new Error("Trip not found");

  // Update trip visibility to public
  db.updateTrip(tripId, { visibility: "public" });

  // Generate public slug
  const trip = db.getTripById(tripId)!;
  const publicSlug = `${trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${trip.id.slice(-6)}`;

  return db.upsertSharedTrip({
    tripId,
    publicSlug
  });
}

export function getPublicTrip(publicSlug: string) {
  return db.getSharedTripByPublicSlug(publicSlug);
}