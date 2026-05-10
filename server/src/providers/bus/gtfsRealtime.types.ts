/**
 * GTFS-Realtime Bus Provider Types
 * Reference: https://gtfs.org/documentation/realtime/reference/
 *
 * These types represent the GTFS-Realtime protobuf feed structure.
 * Feeds are specification-driven, and different operators may not
 * expose all optional fields.
 */

// GTFS-Realtime Feed Message
export interface GtfsRealtimeFeedMessage {
  header: FeedHeader;
  entity: FeedEntity[];
}

export interface FeedHeader {
  gtfs_realtime_version: string;
  incrementality?: "FULL_DATASET" | "DIFFERENTIAL";
  timestamp?: string; // Unix timestamp
}

export interface FeedEntity {
  id: string;
  is_deleted?: boolean;
  trip_update?: TripUpdate;
  vehicle?: VehiclePosition;
  alert?: Alert;
}

// Vehicle Position Entity
export interface VehiclePosition {
  trip?: TripDescriptor;
  vehicle?: VehicleDescriptor;
  position?: Position;
  current_stop_sequence?: number;
  stop_id?: string;
  current_status?: "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT";
  timestamp?: string; // Unix timestamp
  congestion_level?: string;
  occupancy_status?: string;
}

export interface Position {
  latitude: number;
  longitude: number;
  bearing?: number;
  odometer?: number;
  speed?: number;
}

export interface VehicleDescriptor {
  id?: string;
  label?: string;
  license_plate?: string;
}

// Trip Update Entity
export interface TripUpdate {
  trip: TripDescriptor;
  vehicle?: VehicleDescriptor;
  stop_time_update?: StopTimeUpdate[];
  timestamp?: string; // Unix timestamp
  delay?: number;
}

export interface StopTimeUpdate {
  stop_sequence?: number;
  stop_id?: string;
  arrival?: StopTimeEvent;
  departure?: StopTimeEvent;
  schedule_relationship?: "SCHEDULED" | "SKIPPED" | "NO_DATA";
}

export interface StopTimeEvent {
  delay?: number;
  time?: string; // Unix timestamp
  uncertainty?: number;
}

export interface TripDescriptor {
  trip_id?: string;
  route_id?: string;
  direction_id?: 0 | 1;
  start_time?: string; // HH:MM:SS
  start_date?: string; // YYYYMMDD
  schedule_relationship?: "SCHEDULED" | "ADDED" | "UNSCHEDULED" | "CANCELED";
}

// Alert Entity
export interface Alert {
  active_period?: TimeRange[];
  informed_entity?: EntitySelector[];
  cause?: string;
  effect?: string;
  url?: TranslatedString;
  header_text?: TranslatedString;
  description_text?: TranslatedString;
}

export interface TimeRange {
  start?: string; // Unix timestamp
  end?: string; // Unix timestamp
}

export interface EntitySelector {
  agency_id?: string;
  route_id?: string;
  route_type?: number;
  trip?: TripDescriptor;
  stop_id?: string;
}

export interface TranslatedString {
  translation?: Translation[];
}

export interface Translation {
  text: string;
  language?: string;
}

/**
 * Query Parameters for GTFS-Realtime Bus Provider
 */
export interface GtfsRealtimeQueryParams {
  feedUrl: string;
  entityType?: "vehicle" | "trip" | "alert"; // Which entity types to fetch
  routeId?: string; // Optional: filter by route
  stopId?: string; // Optional: filter by stop
  includeRaw?: boolean; // Include raw payload in response
  timeout?: number; // Request timeout in ms (default 10000)
}

/**
 * Error response from provider
 */
export interface ProviderError {
  code: string;
  message: string;
  timestamp: string;
}
