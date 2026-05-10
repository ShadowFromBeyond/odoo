import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_PATH ?? path.join(__dirname, "../../data/traveloop.db");

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}

// User operations
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UserSafe extends Omit<User, "password"> {}

export function createUser(data: Omit<User, "id" | "createdAt">): UserSafe {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, phone, city, country, bio, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.name, data.email, data.password, data.avatar, data.phone, data.city, data.country, data.bio, createdAt);
  
  return { id, name: data.name, email: data.email, avatar: data.avatar, phone: data.phone, city: data.city, country: data.country, bio: data.bio, createdAt };
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as User | undefined;
}

export function findUserById(id: string): UserSafe | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT id, name, email, avatar, phone, city, country, bio, createdAt FROM users WHERE id = ?");
  return stmt.get(id) as UserSafe | undefined;
}

export function findUserByIdWithPassword(id: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
}

// Trip operations
export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverImage: string | null;
  visibility: "private" | "public";
  createdAt: string;
}

export interface TripWithRelations extends Trip {
  stops: TripStop[];
  budget: Budget | null;
  checklist: ChecklistItem[];
  notes: TripNote[];
  sharedTrip: SharedTrip | null;
}

export function createTrip(data: Omit<Trip, "id" | "createdAt">): Trip {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO trips (id, userId, title, description, startDate, endDate, coverImage, visibility, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.userId, data.title, data.description, data.startDate, data.endDate, data.coverImage, data.visibility, createdAt);
  
  return { id, userId: data.userId, title: data.title, description: data.description, startDate: data.startDate, endDate: data.endDate, coverImage: data.coverImage, visibility: data.visibility, createdAt };
}

export function getTripById(id: string): Trip | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM trips WHERE id = ?");
  return stmt.get(id) as Trip | undefined;
}

export function getTripByIdAndUser(id: string, userId: string): Trip | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM trips WHERE id = ? AND userId = ?");
  return stmt.get(id, userId) as Trip | undefined;
}

export function listTripsByUser(userId: string): TripWithRelations[] {
  const db = getDb();
  const trips = db.prepare("SELECT * FROM trips WHERE userId = ? ORDER BY startDate ASC").all(userId) as Trip[];
  
  return trips.map(trip => ({
    ...trip,
    stops: getTripStopsByTripId(trip.id),
    budget: getBudgetByTripId(trip.id),
    checklist: getChecklistByTripId(trip.id),
    notes: getNotesByTripId(trip.id),
    sharedTrip: getSharedTripByTripId(trip.id)
  }));
}

export function getTripWithRelations(id: string, userId: string): TripWithRelations | undefined {
  const db = getDb();
  const trip = db.prepare("SELECT * FROM trips WHERE id = ? AND userId = ?").get(id, userId) as Trip | undefined;
  
  if (!trip) return undefined;
  
  return {
    ...trip,
    stops: getTripStopsByTripId(trip.id),
    budget: getBudgetByTripId(trip.id),
    checklist: getChecklistByTripId(trip.id),
    notes: getNotesByTripId(trip.id),
    sharedTrip: getSharedTripByTripId(trip.id)
  };
}

export function updateTrip(id: string, data: Partial<Omit<Trip, "id" | "userId" | "createdAt">>): Trip {
  const db = getDb();
  
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.startDate !== undefined) { fields.push("startDate = ?"); values.push(data.startDate); }
  if (data.endDate !== undefined) { fields.push("endDate = ?"); values.push(data.endDate); }
  if (data.coverImage !== undefined) { fields.push("coverImage = ?"); values.push(data.coverImage); }
  if (data.visibility !== undefined) { fields.push("visibility = ?"); values.push(data.visibility); }
  
  if (fields.length === 0) {
    return getTripById(id)!;
  }
  
  values.push(id);
  const stmt = db.prepare(`UPDATE trips SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  
  return getTripById(id)!;
}

export function deleteTrip(id: string): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM trips WHERE id = ?");
  stmt.run(id);
}

// TripStop operations
export interface TripStop {
  id: string;
  tripId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
}

export interface TripStopWithActivities extends TripStop {
  activities: Activity[];
}

export function createTripStop(data: Omit<TripStop, "id">): TripStop {
  const db = getDb();
  const id = crypto.randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO trip_stops (id, tripId, cityName, country, arrivalDate, departureDate, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.tripId, data.cityName, data.country, data.arrivalDate, data.departureDate, data.orderIndex);
  
  return { id, tripId: data.tripId, cityName: data.cityName, country: data.country, arrivalDate: data.arrivalDate, departureDate: data.departureDate, orderIndex: data.orderIndex };
}

export function getTripStopsByTripId(tripId: string): TripStopWithActivities[] {
  const db = getDb();
  const stops = db.prepare("SELECT * FROM trip_stops WHERE tripId = ? ORDER BY orderIndex ASC").all(tripId) as TripStop[];
  
  return stops.map(stop => ({
    ...stop,
    activities: getActivitiesByStopId(stop.id)
  }));
}

export function updateTripStopOrder(tripId: string, id: string, orderIndex: number): void {
  const db = getDb();
  const stmt = db.prepare("UPDATE trip_stops SET orderIndex = ? WHERE id = ? AND tripId = ?");
  stmt.run(orderIndex, id, tripId);
}

// Activity operations
export interface Activity {
  id: string;
  stopId: string;
  title: string;
  description: string | null;
  category: string;
  estimatedCost: number;
  startTime: string | null;
  duration: number;
}

export function createActivity(data: Omit<Activity, "id">): Activity {
  const db = getDb();
  const id = crypto.randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO activities (id, stopId, title, description, category, estimatedCost, startTime, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.stopId, data.title, data.description, data.category, data.estimatedCost, data.startTime, data.duration);
  
  return { id, stopId: data.stopId, title: data.title, description: data.description, category: data.category, estimatedCost: data.estimatedCost, startTime: data.startTime, duration: data.duration };
}

export function getActivitiesByStopId(stopId: string): Activity[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM activities WHERE stopId = ?");
  return stmt.all(stopId) as Activity[];
}

// Budget operations
export interface Budget {
  id: string;
  tripId: string;
  transportCost: number;
  hotelCost: number;
  activityCost: number;
  mealCost: number;
  miscellaneousCost: number;
  totalCost: number;
}

export function createBudget(data: Omit<Budget, "id">): Budget {
  const db = getDb();
  const id = crypto.randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO budgets (id, tripId, transportCost, hotelCost, activityCost, mealCost, miscellaneousCost, totalCost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.tripId, data.transportCost, data.hotelCost, data.activityCost, data.mealCost, data.miscellaneousCost, data.totalCost);
  
  return { id, tripId: data.tripId, transportCost: data.transportCost, hotelCost: data.hotelCost, activityCost: data.activityCost, mealCost: data.mealCost, miscellaneousCost: data.miscellaneousCost, totalCost: data.totalCost };
}

export function getBudgetByTripId(tripId: string): Budget | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM budgets WHERE tripId = ?");
  return (stmt.get(tripId) as Budget | undefined) ?? null;
}

export function upsertBudget(data: Omit<Budget, "id">): Budget {
  const db = getDb();
  const existing = getBudgetByTripId(data.tripId);
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE budgets SET 
        transportCost = ?, hotelCost = ?, activityCost = ?, mealCost = ?, miscellaneousCost = ?, totalCost = ?
      WHERE tripId = ?
    `);
    stmt.run(data.transportCost, data.hotelCost, data.activityCost, data.mealCost, data.miscellaneousCost, data.totalCost, data.tripId);
    return getBudgetByTripId(data.tripId)!;
  } else {
    return createBudget(data);
  }
}

// ChecklistItem operations
export interface ChecklistItem {
  id: string;
  tripId: string;
  title: string;
  category: string;
  packed: boolean;
}

export function createChecklistItem(data: Omit<ChecklistItem, "id" | "packed">): ChecklistItem {
  const db = getDb();
  const id = crypto.randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO checklist_items (id, tripId, title, category, packed)
    VALUES (?, ?, ?, ?, 0)
  `);
  
  stmt.run(id, data.tripId, data.title, data.category);
  
  return { id, tripId: data.tripId, title: data.title, category: data.category, packed: false };
}

export function getChecklistByTripId(tripId: string): ChecklistItem[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM checklist_items WHERE tripId = ?");
  return stmt.all(tripId) as ChecklistItem[];
}

export function updateChecklistItem(id: string, data: Partial<ChecklistItem>): ChecklistItem {
  const db = getDb();
  
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (data.packed !== undefined) { fields.push("packed = ?"); values.push(data.packed ? 1 : 0); }
  if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
  if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
  
  if (fields.length === 0) {
    const stmt = db.prepare("SELECT * FROM checklist_items WHERE id = ?");
    return stmt.get(id) as ChecklistItem;
  }
  
  values.push(id);
  const stmt = db.prepare(`UPDATE checklist_items SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  
  const result = db.prepare("SELECT * FROM checklist_items WHERE id = ?").get(id) as ChecklistItem;
  return { ...result, packed: Boolean(result.packed) };
}

export function deleteChecklistItem(id: string): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM checklist_items WHERE id = ?");
  stmt.run(id);
}

// TripNote operations
export interface TripNote {
  id: string;
  tripId: string;
  content: string;
  day: string | null;
  createdAt: string;
}

export function createTripNote(data: Omit<TripNote, "id" | "createdAt">): TripNote {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO trip_notes (id, tripId, content, day, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.tripId, data.content, data.day, createdAt);
  
  return { id, tripId: data.tripId, content: data.content, day: data.day, createdAt };
}

export function getNotesByTripId(tripId: string): TripNote[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM trip_notes WHERE tripId = ? ORDER BY createdAt DESC");
  return stmt.all(tripId) as TripNote[];
}

export function updateTripNote(id: string, data: Partial<Omit<TripNote, "id" | "tripId" | "createdAt">>): TripNote {
  const db = getDb();
  
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
  if (data.day !== undefined) { fields.push("day = ?"); values.push(data.day); }
  
  if (fields.length === 0) {
    const stmt = db.prepare("SELECT * FROM trip_notes WHERE id = ?");
    return stmt.get(id) as TripNote;
  }
  
  values.push(id);
  const stmt = db.prepare(`UPDATE trip_notes SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  
  return db.prepare("SELECT * FROM trip_notes WHERE id = ?").get(id) as TripNote;
}

export function deleteTripNote(id: string): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM trip_notes WHERE id = ?");
  stmt.run(id);
}

// SharedTrip operations
export interface SharedTrip {
  id: string;
  tripId: string;
  publicSlug: string;
}

export interface SharedTripWithTrip extends SharedTrip {
  trip: TripWithRelations & {
    user: { name: string; avatar: string | null };
  };
}

export function createSharedTrip(data: Omit<SharedTrip, "id">): SharedTrip {
  const db = getDb();
  const id = crypto.randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO shared_trips (id, tripId, publicSlug)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(id, data.tripId, data.publicSlug);
  
  return { id, tripId: data.tripId, publicSlug: data.publicSlug };
}

export function getSharedTripByTripId(tripId: string): SharedTrip | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM shared_trips WHERE tripId = ?");
  return (stmt.get(tripId) as SharedTrip | undefined) ?? null;
}

export function getSharedTripByPublicSlug(publicSlug: string): SharedTripWithTrip | null {
  const db = getDb();
  const sharedTrip = db.prepare("SELECT * FROM shared_trips WHERE publicSlug = ?").get(publicSlug) as SharedTrip | undefined;
  
  if (!sharedTrip) return null;
  
  const trip = getTripWithRelations(sharedTrip.tripId, "");
  if (!trip) return null;
  
  // Get user info
  const user = db.prepare("SELECT name, avatar FROM users WHERE id = ?").get(trip.userId) as { name: string; avatar: string | null } | undefined;
  
  if (!user) return null;
  
  return {
    ...sharedTrip,
    trip: {
      ...trip,
      user
    }
  };
}

export function upsertSharedTrip(data: Omit<SharedTrip, "id">): SharedTrip {
  const db = getDb();
  const existing = getSharedTripByTripId(data.tripId);
  
  if (existing) {
    const stmt = db.prepare("UPDATE shared_trips SET publicSlug = ? WHERE tripId = ?");
    stmt.run(data.publicSlug, data.tripId);
    return getSharedTripByTripId(data.tripId)!;
  } else {
    return createSharedTrip(data);
  }
}