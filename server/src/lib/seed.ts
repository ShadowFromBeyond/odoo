import "dotenv/config";
import { getDb, closeDb } from "./db.js";
import { hashPassword } from "./auth.js";

async function seed(): Promise<void> {
  const db = getDb();

  // Clear existing data
  db.exec(`
    DELETE FROM shared_trips;
    DELETE FROM trip_notes;
    DELETE FROM checklist_items;
    DELETE FROM activities;
    DELETE FROM trip_stops;
    DELETE FROM budgets;
    DELETE FROM trips;
    DELETE FROM users;
  `);

  // Create demo user
  const password = await hashPassword("password123");
  const userId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, phone, city, country, bio, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    "Avery Miles",
    "demo@traveloop.app",
    password,
    "https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=Avery",
    "+1 555 0184",
    "San Francisco",
    "USA",
    "Slow travel, food markets, and sunrise walks.",
    createdAt
  );

  // Create demo trip
  const tripId = crypto.randomUUID();
  const tripCreatedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO trips (id, userId, title, description, startDate, endDate, coverImage, visibility, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tripId,
    userId,
    "Japan Spring Loop",
    "Tokyo energy, Kyoto temples, and Osaka food nights.",
    "2026-04-03",
    "2026-04-14",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    "public",
    tripCreatedAt
  );

  // Create budget
  db.prepare(`
    INSERT INTO budgets (id, tripId, transportCost, hotelCost, activityCost, mealCost, miscellaneousCost, totalCost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    tripId,
    620,
    1280,
    410,
    520,
    180,
    3010
  );

  // Create checklist items
  const checklistItems = [
    { title: "Passport", category: "Documents", packed: true },
    { title: "Universal adapter", category: "Gear", packed: false },
    { title: "Light rain jacket", category: "Clothes", packed: false }
  ];

  for (const item of checklistItems) {
    db.prepare(`
      INSERT INTO checklist_items (id, tripId, title, category, packed)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      tripId,
      item.title,
      item.category,
      item.packed ? 1 : 0
    );
  }

  // Create notes
  const notes = [
    { day: "Day 1", content: "Book a quiet arrival dinner near the hotel." },
    { day: "Day 5", content: "Keep Kyoto morning open for Fushimi Inari." }
  ];

  for (const note of notes) {
    db.prepare(`
      INSERT INTO trip_notes (id, tripId, content, day, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      tripId,
      note.content,
      note.day,
      new Date().toISOString()
    );
  }

  // Create trip stops
  const tokyoId = crypto.randomUUID();
  const kyotoId = crypto.randomUUID();

  db.prepare(`
    INSERT INTO trip_stops (id, tripId, cityName, country, arrivalDate, departureDate, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tokyoId,
    tripId,
    "Tokyo",
    "Japan",
    "2026-04-03",
    "2026-04-07",
    0
  );

  db.prepare(`
    INSERT INTO trip_stops (id, tripId, cityName, country, arrivalDate, departureDate, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    kyotoId,
    tripId,
    "Kyoto",
    "Japan",
    "2026-04-07",
    "2026-04-11",
    1
  );

  // Create activities
  const activities = [
    { stopId: tokyoId, title: "Tsukiji breakfast walk", category: "Food", estimatedCost: 45, duration: 120, description: "Seafood stalls and coffee nearby." },
    { stopId: tokyoId, title: "Shibuya evening route", category: "Sightseeing", estimatedCost: 20, duration: 150, description: "Crossing, record shops, rooftop view." },
    { stopId: kyotoId, title: "Fushimi Inari sunrise", category: "Culture", estimatedCost: 0, duration: 150, description: "Early gates before the crowds." }
  ];

  for (const activity of activities) {
    db.prepare(`
      INSERT INTO activities (id, stopId, title, description, category, estimatedCost, startTime, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      activity.stopId,
      activity.title,
      activity.description,
      activity.category,
      activity.estimatedCost,
      null,
      activity.duration
    );
  }

  // Create shared trip
  db.prepare(`
    INSERT INTO shared_trips (id, tripId, publicSlug)
    VALUES (?, ?, ?)
  `).run(
    crypto.randomUUID(),
    tripId,
    "japan-spring-loop-demo"
  );

  console.log("Database seeded successfully!");
  closeDb();
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});