import { z } from "zod";
import type {
  AviationstackFlightResponse,
  AviationstackScheduleResponse,
  AviationstackFlightQuery,
  AviationstackError,
} from "./aviationstack.types.js";
import { mapFlightStatusToNormalized, mapScheduleToNormalized } from "./aviationstack.mapper.js";
import type { NormalizedFlight } from "../../schemas/normalizedTransport.schemas.js";

/**
 * Aviationstack Flight Provider
 * Fetches real-time and schedule flight data from the Aviationstack API.
 *
 * Reference: https://aviationstack.com/documentation
 *
 * Aviationstack is a commercial aviation data provider. This adapter handles:
 * - Real-time flight status (active, scheduled, landed, cancelled, etc.)
 * - Current aircraft position and flight tracking (for active flights)
 * - Flight schedules (if available in subscription)
 * - Departure/arrival times, terminals, gates, delays
 *
 * REQUIREMENTS:
 * - Active Aviationstack subscription with API key
 * - Set AVIATIONSTACK_API_KEY in environment
 * - API key is free-tier or paid plan (check rate limits)
 *
 * TODO: Add caching layer to reduce API calls (flights don't change rapidly)
 * TODO: Add support for batch queries (if available in Aviationstack plan)
 * TODO: Add filtering by aircraft type
 * TODO: Add subscription level detection for feature availability
 */

export interface AviationstackFlightProviderOptions {
  apiKey: string;
  baseUrl?: string; // Defaults to https://api.aviationstack.com/v1
  includeRaw?: boolean;
  timeout?: number; // milliseconds
}

export class AviationstackFlightProvider {
  private apiKey: string;
  private baseUrl: string;
  private includeRaw: boolean;
  private timeout: number;

  constructor(options: AviationstackFlightProviderOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.aviationstack.com/v1";
    this.includeRaw = options.includeRaw || false;
    this.timeout = options.timeout || 10000;

    if (!this.apiKey) {
      throw new Error("AVIATIONSTACK_API_KEY is required");
    }
  }

  /**
   * Fetch flight status by various criteria.
   * At least one of flightIata or flightIcao must be provided.
   *
   * @param query - Query parameters (flightIata, flightIcao, depIata, arrIata, date, etc.)
   * @returns Array of normalized flight objects
   *
   * Example:
   * ```
   * provider.fetchFlightStatus({ flightIata: "BA123", date: "2024-01-15" })
   * ```
   */
  async fetchFlightStatus(query: AviationstackFlightQuery): Promise<NormalizedFlight[]> {
    if (!query.flightIata && !query.flightIcao) {
      throw new Error("Either flightIata or flightIcao must be provided");
    }

    const params = new URLSearchParams({
      access_key: this.apiKey,
    });

    if (query.flightIata) params.append("flight_iata", query.flightIata);
    if (query.flightIcao) params.append("flight_icao", query.flightIcao);
    if (query.depIata) params.append("dep_iata", query.depIata);
    if (query.arrIata) params.append("arr_iata", query.arrIata);
    if (query.date) params.append("flight_date", query.date);
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.offset) params.append("offset", query.offset.toString());

    const response = await this.request<AviationstackFlightResponse>(
      `/flights?${params.toString()}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((flight) =>
      mapFlightStatusToNormalized(flight, "aviationstack", this.includeRaw)
    );
  }

  /**
   * Fetch flight schedules.
   * Availability depends on Aviationstack subscription plan.
   *
   * NOTE: Schedule endpoint may return 403 if not included in your plan.
   * Check your Aviationstack account for available endpoints.
   *
   * TODO: Detect plan limitations and return helpful error message
   */
  async fetchSchedules(query: AviationstackFlightQuery): Promise<NormalizedFlight[]> {
    if (!query.flightIata && !query.flightIcao) {
      throw new Error("Either flightIata or flightIcao must be provided");
    }

    const params = new URLSearchParams({
      access_key: this.apiKey,
    });

    if (query.flightIata) params.append("flight_iata", query.flightIata);
    if (query.flightIcao) params.append("flight_icao", query.flightIcao);
    if (query.depIata) params.append("dep_iata", query.depIata);
    if (query.arrIata) params.append("arr_iata", query.arrIata);
    if (query.date) params.append("flight_date", query.date);
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.offset) params.append("offset", query.offset.toString());

    const response = await this.request<AviationstackScheduleResponse>(
      `/schedules?${params.toString()}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((schedule) =>
      mapScheduleToNormalized(schedule, "aviationstack", this.includeRaw)
    );
  }

  /**
   * Internal method to make HTTP requests to Aviationstack API.
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response.json()) as unknown;
        throw this.parseError(errorData, response.status);
      }

      const data = await response.json();

      // Check for API-level errors (Aviationstack returns 200 with error object)
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        (data as any).error?.message
      ) {
        throw new Error(`Aviationstack API error: ${(data as any).error.message}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("signal is aborted")) {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error("Unknown error calling Aviationstack API");
    }
  }

  /**
   * Parse error response from Aviationstack
   */
  private parseError(data: unknown, status: number): Error {
    if (status === 401) {
      return new Error("Aviationstack: Invalid API key (401)");
    }
    if (status === 403) {
      return new Error(
        "Aviationstack: Access denied (403). Check subscription plan for endpoint availability."
      );
    }
    if (status === 429) {
      return new Error("Aviationstack: Rate limit exceeded (429). Check quota.");
    }

    if (typeof data === "object" && data !== null && "error" in data) {
      const error = (data as any).error;
      if (typeof error === "object" && error.message) {
        return new Error(`Aviationstack: ${error.message}`);
      }
    }

    return new Error(`Aviationstack API error: HTTP ${status}`);
  }
}

/**
 * Factory function to create an Aviationstack flight provider.
 */
export function createAviationstackFlightProvider(
  options: AviationstackFlightProviderOptions
): AviationstackFlightProvider {
  return new AviationstackFlightProvider(options);
}
