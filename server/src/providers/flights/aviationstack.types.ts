/**
 * Aviationstack Flight Provider Types
 * Reference: https://aviationstack.com/documentation
 *
 * This represents the Aviationstack API response structure for flights.
 * Aviationstack is a commercial provider; responses include flight status,
 * departure/arrival details, aircraft info, and more.
 */

/**
 * Aviationstack Flight Status API Response
 */
export interface AviationstackFlightResponse {
  data: AviationstackFlight[];
  pagination?: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

export interface AviationstackFlight {
  flight_date: string; // YYYY-MM-DD
  flight_status: string; // "active", "scheduled", "landed", "cancelled", "delayed", etc.
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string; // Flight number without airline prefix
    iata: string; // Full flight IATA (e.g., "BA123")
    icao: string; // Full flight ICAO
    codeshared?: {
      aircraft_type: string;
      airline: {
        name: string;
        iata: string;
        icao: string;
      };
      flight_number: string;
      flight_iata: string;
      flight_icao: string;
    };
  };
  aircraft?: {
    registration: string;
    aircraft_serial: string;
    aircraft_iata: string; // Aircraft type code (e.g., "B737")
    aircraft_icao: string;
    aircraft_name: string;
  };
  departure: {
    airport: string; // Airport name
    timezone: string; // e.g., "Asia/Kolkata"
    iata: string; // 3-letter code
    icao: string;
    terminal?: string;
    gate?: string;
    scheduled: string; // ISO 8601 datetime
    estimated?: string; // ISO 8601 datetime
    actual?: string; // ISO 8601 datetime
    estimated_runway?: string; // ISO 8601 when actual takeoff occurred
    actual_runway?: string;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    scheduled: string; // ISO 8601 datetime
    estimated?: string; // ISO 8601 datetime
    actual?: string; // ISO 8601 datetime
    estimated_runway?: string; // ISO 8601 when actual landing will occur
    actual_runway?: string; // ISO 8601 when actual landing occurred
  };
  live?: {
    updated: string; // ISO 8601
    latitude: number;
    longitude: number;
    altitude: number;
    direction: number;
    speed_horizontal: number;
    speed_vertical: number;
    is_ground: boolean;
  };
}

/**
 * Query parameters for Aviationstack flight queries
 */
export interface AviationstackFlightQuery {
  // At least one of these must be provided
  flightIata?: string; // Flight IATA code (e.g., "BA123")
  flightIcao?: string; // Flight ICAO code
  // Optional: filter by airport
  depIata?: string; // Departure airport IATA
  arrIata?: string; // Arrival airport IATA
  // Optional: specific date (format: YYYY-MM-DD)
  date?: string;
  // Pagination
  limit?: number; // 1-100, default 100
  offset?: number; // default 0
}

/**
 * Aviationstack API error response
 */
export interface AviationstackError {
  error: {
    code: number;
    message: string;
  };
}

/**
 * Aviationstack Schedule API Response (if available in subscription)
 */
export interface AviationstackScheduleResponse {
  data: AviationstackSchedule[];
  pagination?: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

export interface AviationstackSchedule {
  flight_date: string;
  flight_status?: string; // May not be available in schedule data
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  aircraft?: {
    aircraft_iata: string;
    aircraft_name: string;
  };
  departure: {
    airport: string;
    iata: string;
    icao: string;
    timezone: string;
    terminal?: string;
    gate?: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    iata: string;
    icao: string;
    timezone: string;
    terminal?: string;
    gate?: string;
    scheduled: string;
  };
}

/**
 * Provider error
 */
export interface ProviderError {
  code: string;
  message: string;
  timestamp: string;
}
