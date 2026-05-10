import { Request, Response } from "express";
import { z } from "zod";
import { createGtfsRealtimeBusProvider } from "../providers/bus/gtfsRealtimeBusProvider.js";
import { createAviationstackFlightProvider } from "../providers/flights/aviationstackFlightProvider.js";
import { createTrainProvider } from "../providers/trains/trainProvider.interface.js";
import type { ProviderCapability } from "../schemas/normalizedTransport.schemas.js";

/**
 * Transport Provider Controller
 * Handles HTTP requests for transport data providers.
 * All endpoints are read-only (GET only).
 */

// Request validation schemas
const busBusVehicleQuerySchema = z.object({
  feedUrl: z.string().url().describe("GTFS-Realtime feed URL"),
  authHeader: z.string().optional().describe("Authorization header (e.g., Bearer token)"),
  routeId: z.string().optional(),
  includeRaw: z.enum(["true", "false"]).optional(),
});

const busTripUpdateQuerySchema = z.object({
  feedUrl: z.string().url(),
  authHeader: z.string().optional(),
  routeId: z.string().optional(),
  includeRaw: z.enum(["true", "false"]).optional(),
});

const busAlertQuerySchema = z.object({
  feedUrl: z.string().url(),
  authHeader: z.string().optional(),
  includeRaw: z.enum(["true", "false"]).optional(),
});

const flightStatusQuerySchema = z.object({
  flightIata: z.string().optional(),
  flightIcao: z.string().optional(),
  depIata: z.string().optional(),
  arrIata: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  includeRaw: z.enum(["true", "false"]).optional(),
});

const trainLiveStatusQuerySchema = z.object({
  trainNumber: z.string().describe("Train number (4-5 digits)"),
  date: z.string().describe("Date YYYY-MM-DD"),
});

const trainPnrQuerySchema = z.object({
  pnr: z.string().describe("PNR (10 digits)"),
});

const trainScheduleQuerySchema = z.object({
  trainNumber: z.string().describe("Train number (4-5 digits)"),
  date: z.string().optional().describe("Date YYYY-MM-DD"),
});

/**
 * GET /api/transport/buses/vehicles
 * Fetch vehicle positions from a GTFS-Realtime feed.
 */
export async function getBusVehicles(req: Request, res: Response) {
  try {
    const query = busBusVehicleQuerySchema.parse(req.query);
    const provider = createGtfsRealtimeBusProvider({
      feedUrl: query.feedUrl,
      authHeader: query.authHeader,
      includeRaw: query.includeRaw === "true",
    });

    const vehicles = await provider.fetchVehiclePositions();

    res.json({
      data: vehicles,
      count: vehicles.length,
      provider: "gtfs-realtime",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/buses/trips
 * Fetch trip updates from a GTFS-Realtime feed.
 */
export async function getBusTrips(req: Request, res: Response) {
  try {
    const query = busTripUpdateQuerySchema.parse(req.query);
    const provider = createGtfsRealtimeBusProvider({
      feedUrl: query.feedUrl,
      authHeader: query.authHeader,
      includeRaw: query.includeRaw === "true",
    });

    const tripUpdates = await provider.fetchTripUpdates();

    res.json({
      data: tripUpdates,
      count: tripUpdates.length,
      provider: "gtfs-realtime",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/buses/alerts
 * Fetch service alerts from a GTFS-Realtime feed.
 */
export async function getBusAlerts(req: Request, res: Response) {
  try {
    const query = busAlertQuerySchema.parse(req.query);
    const provider = createGtfsRealtimeBusProvider({
      feedUrl: query.feedUrl,
      authHeader: query.authHeader,
      includeRaw: query.includeRaw === "true",
    });

    const alerts = await provider.fetchServiceAlerts();

    res.json({
      data: alerts,
      count: alerts.length,
      provider: "gtfs-realtime",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/flights/status
 * Fetch flight status from Aviationstack.
 */
export async function getFlightStatus(req: Request, res: Response) {
  try {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: "Not Configured",
        message: "AVIATIONSTACK_API_KEY not set in environment",
      });
    }

    const query = flightStatusQuerySchema.parse(req.query);
    const provider = createAviationstackFlightProvider({
      apiKey,
      includeRaw: query.includeRaw === "true",
    });

    const flights = await provider.fetchFlightStatus({
      flightIata: query.flightIata,
      flightIcao: query.flightIcao,
      depIata: query.depIata,
      arrIata: query.arrIata,
      date: query.date,
      limit: query.limit,
      offset: query.offset,
    });

    res.json({
      data: flights,
      count: flights.length,
      provider: "aviationstack",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/flights/schedules
 * Fetch flight schedules from Aviationstack (if available in subscription).
 */
export async function getFlightSchedules(req: Request, res: Response) {
  try {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: "Not Configured",
        message: "AVIATIONSTACK_API_KEY not set in environment",
      });
    }

    const query = flightStatusQuerySchema.parse(req.query);
    const provider = createAviationstackFlightProvider({
      apiKey,
      includeRaw: query.includeRaw === "true",
    });

    const schedules = await provider.fetchSchedules({
      flightIata: query.flightIata,
      flightIcao: query.flightIcao,
      depIata: query.depIata,
      arrIata: query.arrIata,
      date: query.date,
      limit: query.limit,
      offset: query.offset,
    });

    res.json({
      data: schedules,
      count: schedules.length,
      provider: "aviationstack",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/trains/live
 * Fetch live train status (stub only - no real API integration yet).
 */
export async function getTrainLiveStatus(req: Request, res: Response) {
  try {
    const query = trainLiveStatusQuerySchema.parse(req.query);
    const provider = createTrainProvider();

    const status = await provider.fetchLiveStatus({
      trainNumber: query.trainNumber,
      date: query.date,
    });

    res.json({
      data: status,
      provider: "indian-rail-stub",
      warning: "This is a stub implementation. Real API integration required.",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/trains/pnr
 * Fetch train PNR status (stub only - no real API integration yet).
 */
export async function getTrainPnrStatus(req: Request, res: Response) {
  try {
    const query = trainPnrQuerySchema.parse(req.query);
    const provider = createTrainProvider();

    const status = await provider.fetchPnrStatus({
      pnr: query.pnr,
    });

    res.json({
      data: status,
      provider: "indian-rail-stub",
      warning: "This is a stub implementation. Real API integration required.",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/trains/schedule
 * Fetch train schedule (stub only - no real API integration yet).
 */
export async function getTrainSchedule(req: Request, res: Response) {
  try {
    const query = trainScheduleQuerySchema.parse(req.query);
    const provider = createTrainProvider();

    const schedule = await provider.fetchSchedule({
      trainNumber: query.trainNumber,
      date: query.date,
    });

    res.json({
      data: schedule,
      count: schedule.length,
      provider: "indian-rail-stub",
      warning: "This is a stub implementation. Real API integration required.",
    });
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /api/transport/providers/capabilities
 * Describe capabilities of all supported providers.
 */
export async function getProviderCapabilities(req: Request, res: Response) {
  const capabilities: ProviderCapability[] = [
    {
      provider: "gtfs-realtime",
      mode: "bus",
      realtimeSupport: true,
      authRequired: false, // Some feeds require auth; configure in provider
      status: "implemented",
      endpoints: [
        "/api/transport/buses/vehicles",
        "/api/transport/buses/trips",
        "/api/transport/buses/alerts",
      ],
      requiredEnv: ["GTFS_REALTIME_FEED_URL"],
      notes:
        "GTFS-Realtime is specification-driven. Feed availability depends on transit operator.",
    },
    {
      provider: "aviationstack",
      mode: "flight",
      realtimeSupport: true,
      authRequired: true,
      status: "implemented",
      endpoints: [
        "/api/transport/flights/status",
        "/api/transport/flights/schedules", // if available in subscription
      ],
      requiredEnv: ["AVIATIONSTACK_API_KEY"],
      notes:
        "Commercial provider. Requires active subscription. Check rate limits and plan tier.",
    },
    {
      provider: "indian-rail-stub",
      mode: "train",
      realtimeSupport: true,
      authRequired: false, // Will depend on chosen real provider
      status: "stubbed",
      endpoints: [
        "/api/transport/trains/live",
        "/api/transport/trains/pnr",
        "/api/transport/trains/schedule",
      ],
      requiredEnv: [],
      notes:
        "Stub only. Integration engineer must select and implement real provider (IndianRailAPI, etc.).",
    },
  ];

  res.json({
    data: capabilities,
    count: capabilities.length,
  });
}

/**
 * Error handler
 */
function handleError(res: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (error instanceof Error) {
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: error.message,
      });
    }
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return res.status(403).json({
        error: "Forbidden",
        message: error.message,
      });
    }
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      return res.status(504).json({
        error: "Gateway Timeout",
        message: error.message,
      });
    }
    if (error.message.includes("Invalid")) {
      return res.status(400).json({
        error: "Bad Request",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Provider Error",
      message: error.message,
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: "Unknown error",
  });
}
