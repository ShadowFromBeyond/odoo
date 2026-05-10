import { z } from "zod";

/**
 * Normalized Bus Schema
 * Represents a normalized GTFS-Realtime bus vehicle/trip/alert entity.
 * All provider-specific adapters map their responses to this shape.
 * Fields are optional because different GTFS-RT feeds may expose different entities.
 */
export const normalizedBusVehicleSchema = z.object({
  provider: z.string().describe("Provider name (e.g., 'gtfs-realtime-delhi')"),
  entityId: z.string().describe("Unique entity ID from feed"),
  vehicleId: z.string().optional().describe("Vehicle registration/ID if available"),
  tripId: z.string().optional().describe("Trip ID from GTFS-RT trip_id"),
  routeId: z.string().optional().describe("Route ID from GTFS-RT route_id"),
  currentStatus: z.enum(["INCOMING_AT", "STOPPED_AT", "IN_TRANSIT"]).optional(),
  latitude: z.number().optional().describe("Vehicle latitude"),
  longitude: z.number().optional().describe("Vehicle longitude"),
  bearing: z.number().optional().describe("Compass bearing (0-360)"),
  speed: z.number().optional().describe("Speed in m/s"),
  occupancyStatus: z.string().optional().describe("GTFS-RT occupancy_status enum value"),
  timestamp: z.string().optional().describe("ISO 8601 timestamp of last update"),
  raw: z.record(z.any()).optional().describe("Raw provider payload subset for debugging"),
});

export const normalizedBusTripUpdateSchema = z.object({
  provider: z.string(),
  entityId: z.string(),
  tripId: z.string().optional(),
  routeId: z.string().optional(),
  startDate: z.string().optional().describe("YYYYMMDD"),
  scheduleRelationship: z.enum(["SCHEDULED", "ADDED", "UNSCHEDULED", "CANCELED"]).optional(),
  stopSequence: z.number().optional(),
  stopId: z.string().optional(),
  arrival: z.object({
    delay: z.number().optional(),
    time: z.string().optional(),
    uncertainty: z.number().optional(),
  }).optional(),
  departure: z.object({
    delay: z.number().optional(),
    time: z.string().optional(),
    uncertainty: z.number().optional(),
  }).optional(),
  timestamp: z.string().optional(),
  raw: z.record(z.any()).optional(),
});

export const normalizedBusAlertSchema = z.object({
  provider: z.string(),
  entityId: z.string(),
  activeStart: z.string().optional().describe("ISO 8601"),
  activeEnd: z.string().optional().describe("ISO 8601"),
  affectedRoutes: z.array(z.string()).optional(),
  affectedStops: z.array(z.string()).optional(),
  causeName: z.string().optional(),
  effectName: z.string().optional(),
  headerText: z.string().optional(),
  descriptionText: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  raw: z.record(z.any()).optional(),
});

export type NormalizedBusVehicle = z.infer<typeof normalizedBusVehicleSchema>;
export type NormalizedBusTripUpdate = z.infer<typeof normalizedBusTripUpdateSchema>;
export type NormalizedBusAlert = z.infer<typeof normalizedBusAlertSchema>;

/**
 * Normalized Flight Schema
 * Represents a normalized Aviationstack-style flight status response.
 * Maps commercial flight API data to a common shape.
 */
export const normalizedFlightSchema = z.object({
  provider: z.string().describe("Provider name (e.g., 'aviationstack')"),
  flightDate: z.string().optional().describe("Flight date YYYY-MM-DD"),
  flightStatus: z.string().optional().describe("Flight status (active, scheduled, landed, etc.)"),
  airlineName: z.string().optional(),
  airlineIata: z.string().optional().describe("2-letter airline IATA code"),
  airlineIcao: z.string().optional().describe("3-letter airline ICAO code"),
  flightNumber: z.string().optional().describe("Flight number without airline prefix"),
  flightIata: z.string().optional().describe("Full flight identifier (e.g., BA123)"),
  flightIcao: z.string().optional(),
  departureAirport: z.string().optional(),
  departureIata: z.string().optional().describe("3-letter IATA code"),
  departureIcao: z.string().optional(),
  departureTerminal: z.string().optional(),
  departureGate: z.string().optional(),
  departureScheduled: z.string().optional().describe("ISO 8601 scheduled departure"),
  departureActual: z.string().optional().describe("ISO 8601 actual departure"),
  arrivalAirport: z.string().optional(),
  arrivalIata: z.string().optional().describe("3-letter IATA code"),
  arrivalIcao: z.string().optional(),
  arrivalTerminal: z.string().optional(),
  arrivalGate: z.string().optional(),
  arrivalScheduled: z.string().optional().describe("ISO 8601 scheduled arrival"),
  arrivalActual: z.string().optional().describe("ISO 8601 actual arrival"),
  delayMinutes: z.number().optional().describe("Delay in minutes (negative = early)"),
  baggage: z.string().optional().describe("Baggage claim carousel/belt"),
  aircraft: z.string().optional().describe("Aircraft type code"),
  codeshare: z.string().optional(),
  raw: z.record(z.any()).optional().describe("Raw provider payload subset for debugging"),
});

export type NormalizedFlight = z.infer<typeof normalizedFlightSchema>;

/**
 * Normalized Train Schema
 * Placeholder for future integration with Indian railways or other train APIs.
 * Schema is defined to guide the integration engineer.
 */
export const normalizedTrainSchema = z.object({
  provider: z.string().describe("Provider name (e.g., 'indian-rail-stub')"),
  trainNumber: z.string().optional().describe("Train number/code"),
  trainName: z.string().optional(),
  runDate: z.string().optional().describe("Date the train is running YYYY-MM-DD"),
  currentStation: z.string().optional().describe("Current station name"),
  currentStationCode: z.string().optional().describe("Station code (e.g., NEW for New Delhi)"),
  delayMinutes: z.number().optional().describe("Delay in minutes"),
  statusText: z.string().optional().describe("Human-readable status"),
  expectedArrival: z.string().optional().describe("ISO 8601 expected arrival at destination"),
  expectedDeparture: z.string().optional().describe("ISO 8601 expected departure from current station"),
  platform: z.string().optional(),
  pnr: z.string().optional().describe("Passenger Name Record for PNR queries"),
  berthInfo: z.string().optional().describe("Berth/seat allocation if available"),
  classOfTravel: z.string().optional(),
  passengerName: z.string().optional(),
  bookingStatus: z.string().optional(),
  journey: z.object({
    fromStation: z.string().optional(),
    fromStationCode: z.string().optional(),
    toStation: z.string().optional(),
    toStationCode: z.string().optional(),
    departureScheduled: z.string().optional(),
    arrivalScheduled: z.string().optional(),
  }).optional(),
  raw: z.record(z.any()).optional().describe("Raw provider payload subset for debugging"),
});

export type NormalizedTrain = z.infer<typeof normalizedTrainSchema>;

/**
 * Provider Capabilities Schema
 * Describes which endpoints and features a provider supports.
 */
export const providerCapabilitySchema = z.object({
  provider: z.string(),
  mode: z.enum(["bus", "flight", "train"]),
  realtimeSupport: z.boolean(),
  authRequired: z.boolean(),
  status: z.enum(["implemented", "stubbed", "planned"]),
  endpoints: z.array(z.string()),
  notes: z.string().optional(),
  requiredEnv: z.array(z.string()).optional(),
});

export type ProviderCapability = z.infer<typeof providerCapabilitySchema>;
