import { z } from "zod";
import type {
  GtfsRealtimeFeedMessage,
  GtfsRealtimeQueryParams,
  ProviderError,
} from "./gtfsRealtime.types.js";
import {
  mapVehiclePositionToNormalized,
  mapTripUpdateToNormalized,
  mapAlertToNormalized,
} from "./gtfsRealtime.mapper.js";
import type {
  NormalizedBusVehicle,
  NormalizedBusTripUpdate,
  NormalizedBusAlert,
} from "../../schemas/normalizedTransport.schemas.js";

/**
 * GTFS-Realtime Bus Provider
 * Fetches real-time bus data from GTFS-Realtime feeds.
 *
 * Reference: https://gtfs.org/documentation/realtime/reference/
 *
 * GTFS-Realtime feeds are protobuf-based. This adapter handles:
 * - Vehicle positions (current location, speed, bearing)
 * - Trip updates (schedule deviations, delays)
 * - Service alerts (disruptions, advisories)
 *
 * TODO: Add protobuf parsing library (e.g., protobufjs) to parse binary feeds.
 *       Most GTFS-Realtime feeds are served as binary protobuf, not JSON.
 * TODO: Add authentication support (Basic Auth, Bearer tokens, custom headers).
 * TODO: Add feed signature verification for enhanced security.
 * TODO: Add retry logic with exponential backoff.
 * TODO: Add polling mechanism for continuous feed updates.
 */

export interface GtfsRealtimeBusProviderOptions {
  feedUrl: string;
  providerName?: string;
  authHeader?: string; // e.g., "Bearer token" or "Basic base64"
  customHeaders?: Record<string, string>;
  timeout?: number; // milliseconds
  includeRaw?: boolean;
}

export class GtfsRealtimeBusProvider {
  private feedUrl: string;
  private providerName: string;
  private authHeader?: string;
  private customHeaders: Record<string, string>;
  private timeout: number;
  private includeRaw: boolean;

  constructor(options: GtfsRealtimeBusProviderOptions) {
    this.feedUrl = options.feedUrl;
    this.providerName = options.providerName || "gtfs-realtime";
    this.authHeader = options.authHeader;
    this.customHeaders = options.customHeaders || {};
    this.timeout = options.timeout || 10000;
    this.includeRaw = options.includeRaw || false;
  }

  /**
   * Fetch vehicle positions from the GTFS-Realtime feed.
   * Returns normalized vehicle position objects.
   */
  async fetchVehiclePositions(
    queryParams?: Partial<GtfsRealtimeQueryParams>
  ): Promise<NormalizedBusVehicle[]> {
    const feedMessage = await this.fetchFeedMessage(queryParams);
    if (!feedMessage) return [];

    const vehicles: NormalizedBusVehicle[] = [];
    for (const entity of feedMessage.entity) {
      if (!entity.vehicle) continue;

      const normalized = mapVehiclePositionToNormalized(
        entity,
        this.providerName,
        queryParams?.includeRaw ?? this.includeRaw
      );
      if (normalized) {
        vehicles.push(normalized);
      }
    }

    return vehicles;
  }

  /**
   * Fetch trip updates from the GTFS-Realtime feed.
   * Returns normalized trip update objects with delay information.
   */
  async fetchTripUpdates(
    queryParams?: Partial<GtfsRealtimeQueryParams>
  ): Promise<NormalizedBusTripUpdate[]> {
    const feedMessage = await this.fetchFeedMessage(queryParams);
    if (!feedMessage) return [];

    const tripUpdates: NormalizedBusTripUpdate[] = [];
    for (const entity of feedMessage.entity) {
      if (!entity.trip_update) continue;

      const normalized = mapTripUpdateToNormalized(
        entity,
        this.providerName,
        queryParams?.includeRaw ?? this.includeRaw
      );
      if (normalized) {
        tripUpdates.push(normalized);
      }
    }

    return tripUpdates;
  }

  /**
   * Fetch service alerts from the GTFS-Realtime feed.
   * Returns normalized alert objects.
   */
  async fetchServiceAlerts(
    queryParams?: Partial<GtfsRealtimeQueryParams>
  ): Promise<NormalizedBusAlert[]> {
    const feedMessage = await this.fetchFeedMessage(queryParams);
    if (!feedMessage) return [];

    const alerts: NormalizedBusAlert[] = [];
    for (const entity of feedMessage.entity) {
      if (!entity.alert) continue;

      const normalized = mapAlertToNormalized(
        entity,
        this.providerName,
        queryParams?.includeRaw ?? this.includeRaw
      );
      if (normalized) {
        alerts.push(normalized);
      }
    }

    return alerts;
  }

  /**
   * Fetch the raw GTFS-Realtime feed message.
   * Internal method; typically not called directly.
   *
   * NOTE: This implementation currently expects JSON-formatted feed for testing.
   * TODO: Implement protobuf parsing for binary GTFS-Realtime feeds.
   *       Use a library like protobufjs or transit-realtime protobuf definitions.
   */
  private async fetchFeedMessage(
    queryParams?: Partial<GtfsRealtimeQueryParams>
  ): Promise<GtfsRealtimeFeedMessage | null> {
    const url = queryParams?.feedUrl || this.feedUrl;
    const headers: Record<string, string> = {
      "Accept": "application/json, application/protobuf",
      ...this.customHeaders,
    };

    if (this.authHeader) {
      headers["Authorization"] = this.authHeader;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        queryParams?.timeout ?? this.timeout
      );

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} from GTFS-RT feed: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type") || "";

      // Handle protobuf (binary) response
      if (
        contentType.includes("application/protobuf") ||
        contentType.includes("application/octet-stream")
      ) {
        // TODO: Parse protobuf binary format
        // For now, throw informative error
        throw new Error(
          "Binary GTFS-Realtime protobuf parsing not yet implemented. " +
          "Add protobufjs library and transit-realtime.proto definition."
        );
      }

      // Handle JSON response
      if (contentType.includes("application/json")) {
        const data = await response.json();
        // Validate against GTFS-Realtime structure
        const validated = this.validateFeedMessage(data);
        return validated;
      }

      // Attempt JSON fallback
      const data = await response.json();
      return this.validateFeedMessage(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("signal is aborted")) {
          throw new Error(`Request timeout after ${queryParams?.timeout ?? this.timeout}ms`);
        }
        throw new Error(`Failed to fetch GTFS-Realtime feed: ${error.message}`);
      }
      throw new Error("Unknown error fetching GTFS-Realtime feed");
    }
  }

  /**
   * Validate feed message structure.
   * Basic validation; does not enforce all required fields.
   */
  private validateFeedMessage(data: unknown): GtfsRealtimeFeedMessage {
    const schema = z.object({
      header: z.object({
        gtfs_realtime_version: z.string(),
        incrementality: z.enum(["FULL_DATASET", "DIFFERENTIAL"]).optional(),
        timestamp: z.union([z.string(), z.number()]).optional(),
      }),
      entity: z.array(
        z.object({
          id: z.string(),
          is_deleted: z.boolean().optional(),
          trip_update: z.any().optional(),
          vehicle: z.any().optional(),
          alert: z.any().optional(),
        })
      ),
    });

    return schema.parse(data);
  }
}

/**
 * Factory function to create a GTFS-Realtime bus provider.
 */
export function createGtfsRealtimeBusProvider(
  options: GtfsRealtimeBusProviderOptions
): GtfsRealtimeBusProvider {
  return new GtfsRealtimeBusProvider(options);
}
