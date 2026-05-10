import {
  NormalizedBusVehicle,
  NormalizedBusTripUpdate,
  NormalizedBusAlert,
} from "../../schemas/normalizedTransport.schemas.js";
import type {
  VehiclePosition,
  TripUpdate,
  Alert,
  FeedEntity,
} from "./gtfsRealtime.types.js";

/**
 * Mapper functions to convert GTFS-Realtime entities to normalized schema.
 * These are pure functions for testability.
 */

export function mapVehiclePositionToNormalized(
  entity: FeedEntity,
  provider: string,
  rawInclude: boolean = false
): NormalizedBusVehicle | null {
  if (!entity.vehicle) return null;

  const vehicle = entity.vehicle;
  const position = vehicle.position;

  const normalized: NormalizedBusVehicle = {
    provider,
    entityId: entity.id,
    vehicleId: vehicle.vehicle?.id,
    tripId: vehicle.trip?.trip_id,
    routeId: vehicle.trip?.route_id,
    currentStatus: vehicle.current_status as any,
    latitude: position?.latitude,
    longitude: position?.longitude,
    bearing: position?.bearing,
    speed: position?.speed,
    occupancyStatus: vehicle.occupancy_status,
    timestamp: vehicle.timestamp ? new Date(parseInt(vehicle.timestamp) * 1000).toISOString() : undefined,
  };

  if (rawInclude) {
    normalized.raw = {
      vehicle_id: vehicle.vehicle?.id,
      trip_id: vehicle.trip?.trip_id,
      position: position,
      current_status: vehicle.current_status,
      timestamp: vehicle.timestamp,
    };
  }

  return normalized;
}

export function mapTripUpdateToNormalized(
  entity: FeedEntity,
  provider: string,
  rawInclude: boolean = false
): NormalizedBusTripUpdate | null {
  if (!entity.trip_update) return null;

  const tripUpdate = entity.trip_update;
  const trip = tripUpdate.trip;

  const normalized: NormalizedBusTripUpdate = {
    provider,
    entityId: entity.id,
    tripId: trip.trip_id,
    routeId: trip.route_id,
    startDate: trip.start_date,
    scheduleRelationship: trip.schedule_relationship as any,
    timestamp: tripUpdate.timestamp
      ? new Date(parseInt(tripUpdate.timestamp) * 1000).toISOString()
      : undefined,
  };

  // Include first stop time update if available
  if (tripUpdate.stop_time_update && tripUpdate.stop_time_update.length > 0) {
    const firstStop = tripUpdate.stop_time_update[0];
    normalized.stopSequence = firstStop.stop_sequence;
    normalized.stopId = firstStop.stop_id;
    if (firstStop.arrival) {
      normalized.arrival = {
        delay: firstStop.arrival.delay,
        time: firstStop.arrival.time
          ? new Date(parseInt(firstStop.arrival.time) * 1000).toISOString()
          : undefined,
        uncertainty: firstStop.arrival.uncertainty,
      };
    }
    if (firstStop.departure) {
      normalized.departure = {
        delay: firstStop.departure.delay,
        time: firstStop.departure.time
          ? new Date(parseInt(firstStop.departure.time) * 1000).toISOString()
          : undefined,
        uncertainty: firstStop.departure.uncertainty,
      };
    }
  }

  if (rawInclude) {
    normalized.raw = {
      trip: trip,
      vehicle: tripUpdate.vehicle,
      timestamp: tripUpdate.timestamp,
      stop_time_updates_count: tripUpdate.stop_time_update?.length,
    };
  }

  return normalized;
}

export function mapAlertToNormalized(
  entity: FeedEntity,
  provider: string,
  rawInclude: boolean = false
): NormalizedBusAlert | null {
  if (!entity.alert) return null;

  const alert = entity.alert;
  const informedEntities = alert.informed_entity || [];

  const normalized: NormalizedBusAlert = {
    provider,
    entityId: entity.id,
    causeName: alert.cause,
    effectName: alert.effect,
    headerText: alert.header_text?.translation?.[0]?.text,
    descriptionText: alert.description_text?.translation?.[0]?.text,
    url: alert.url?.translation?.[0]?.text,
    affectedRoutes: informedEntities
      .map((e) => e.route_id)
      .filter((id) => id !== undefined) as string[],
    affectedStops: informedEntities
      .map((e) => e.stop_id)
      .filter((id) => id !== undefined) as string[],
  };

  if (alert.active_period && alert.active_period.length > 0) {
    const period = alert.active_period[0];
    if (period.start) {
      normalized.activeStart = new Date(parseInt(period.start) * 1000).toISOString();
    }
    if (period.end) {
      normalized.activeEnd = new Date(parseInt(period.end) * 1000).toISOString();
    }
  }

  if (rawInclude) {
    normalized.raw = {
      cause: alert.cause,
      effect: alert.effect,
      active_period_count: alert.active_period?.length,
      informed_entity_count: informedEntities.length,
    };
  }

  return normalized;
}

/**
 * Helper to convert Unix timestamp to ISO 8601
 */
export function unixToIso(unixSeconds?: string | number): string | undefined {
  if (!unixSeconds) return undefined;
  const ms = typeof unixSeconds === "string" ? parseInt(unixSeconds) * 1000 : unixSeconds * 1000;
  return new Date(ms).toISOString();
}
