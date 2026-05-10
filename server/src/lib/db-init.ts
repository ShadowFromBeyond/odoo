import "dotenv/config";
import { getDb, closeDb } from "./db.js";

function initializeDatabase(): void {
  const db = getDb();

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      phone TEXT,
      city TEXT,
      country TEXT,
      bio TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      coverImage TEXT,
      visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'public')),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trip_stops (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      cityName TEXT NOT NULL,
      country TEXT NOT NULL,
      arrivalDate TEXT NOT NULL,
      departureDate TEXT NOT NULL,
      orderIndex INTEGER NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      stopId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      estimatedCost REAL NOT NULL DEFAULT 0,
      startTime TEXT,
      duration INTEGER NOT NULL,
      FOREIGN KEY (stopId) REFERENCES trip_stops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      tripId TEXT UNIQUE NOT NULL,
      transportCost REAL NOT NULL DEFAULT 0,
      hotelCost REAL NOT NULL DEFAULT 0,
      activityCost REAL NOT NULL DEFAULT 0,
      mealCost REAL NOT NULL DEFAULT 0,
      miscellaneousCost REAL NOT NULL DEFAULT 0,
      totalCost REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      packed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trip_notes (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      content TEXT NOT NULL,
      day TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shared_trips (
      id TEXT PRIMARY KEY,
      tripId TEXT UNIQUE NOT NULL,
      publicSlug TEXT UNIQUE NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_trips_userId ON trips(userId);
    CREATE INDEX IF NOT EXISTS idx_trip_stops_tripId ON trip_stops(tripId);
    CREATE INDEX IF NOT EXISTS idx_activities_stopId ON activities(stopId);
    CREATE INDEX IF NOT EXISTS idx_checklist_items_tripId ON checklist_items(tripId);
    CREATE INDEX IF NOT EXISTS idx_trip_notes_tripId ON trip_notes(tripId);
  `);

  console.log("Database initialized successfully!");
  closeDb();
}

initializeDatabase();