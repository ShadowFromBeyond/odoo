import type { NormalizedTrain } from "../../schemas/normalizedTransport.schemas.js";

/**
 * Train Provider Interface
 * Defines the contract for train data providers.
 *
 * NOTE: This is a future-facing interface. Integration engineer should:
 * 1. Research available Indian rail APIs (RailAPI, IndianRailAPI, etc.)
 * 2. Verify license/ToS compliance
 * 3. Implement a concrete provider following this interface
 * 4. Replace StubIndianRailProvider with real implementation
 *
 * Current status: Stub only (no real external integration)
 */

export interface ITrainProvider {
  /**
   * Fetch live train status by train number and date.
   * Returns current location, delay, expected arrival/departure.
   */
  fetchLiveStatus(options: {
    trainNumber: string;
    date: string; // YYYY-MM-DD
  }): Promise<NormalizedTrain | null>;

  /**
   * Fetch PNR (Passenger Name Record) status.
   * Returns berth allocation, passenger name, booking status.
   */
  fetchPnrStatus(options: {
    pnr: string; // 10-digit PNR
  }): Promise<NormalizedTrain | null>;

  /**
   * Fetch train schedule (route, stops, timings).
   * Returns list of stops with expected timings.
   */
  fetchSchedule(options: {
    trainNumber: string;
    date?: string; // YYYY-MM-DD, optional
  }): Promise<NormalizedTrain[]>;
}

export interface TrainStop {
  station: string;
  stationCode: string;
  sequenceNumber: number;
  arrivalScheduled?: string;
  arrivalActual?: string;
  departureScheduled?: string;
  departureActual?: string;
  platform?: string;
  haltDuration?: number; // minutes
}

/**
 * Stub Indian Rail Provider
 * Placeholder for future integration with real Indian Railway data.
 *
 * Current implementation returns mocked responses only.
 * No external API calls are made.
 *
 * TODO for integration engineer:
 * ================================
 * 1. RESEARCH: Evaluate these options:
 *    - IndianRailAPI (https://indianrailapi.com/api-collection/live-train-status)
 *    - RailwayAPI (alternative vendors)
 *    - Official Indian Railways Data Services (if available)
 *    - Check ToS and licensing requirements
 *
 * 2. API SELECTION: Once chosen:
 *    - Document base URL
 *    - Document auth method (API key, OAuth, etc.)
 *    - Document rate limits
 *    - Add to .env.example
 *
 * 3. IMPLEMENTATION:
 *    - Create new class extending ITrainProvider
 *    - Implement fetchLiveStatus with real API calls
 *    - Implement fetchPnrStatus with real API calls
 *    - Implement fetchSchedule with real API calls
 *    - Update mapper to convert provider response to NormalizedTrain
 *    - Add error handling and validation
 *    - Add tests
 *
 * 4. CREDENTIALS:
 *    - Add API key/auth token to .env
 *    - Load from environment in constructor
 *    - Never hardcode credentials
 *
 * 5. VALIDATION:
 *    - Ensure data complies with Indian Railways schema (if applicable)
 *    - Validate PNR format (10 digits)
 *    - Validate train number format
 *    - Validate date format
 *
 * 6. TESTING:
 *    - Add unit tests with mocked API responses
 *    - Add integration tests with real API (if permitted)
 *    - Document test data (train numbers, PNRs for testing)
 */

export class StubIndianRailProvider implements ITrainProvider {
  private providerName: string = "indian-rail-stub";

  /**
   * Fetch live train status - STUB ONLY
   * Returns a mocked response.
   *
   * TODO: Replace with real API call to chosen provider.
   */
  async fetchLiveStatus(options: {
    trainNumber: string;
    date: string;
  }): Promise<NormalizedTrain | null> {
    // Input validation
    if (!options.trainNumber || !/^\d{4,5}$/.test(options.trainNumber)) {
      throw new Error("Invalid train number. Must be 4-5 digits.");
    }
    if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }

    // TODO: Call real API endpoint
    // const response = await this.callProviderAPI("live_status", options);
    // return mapProviderResponseToNormalized(response);

    // Stub response for now
    return {
      provider: this.providerName,
      trainNumber: options.trainNumber,
      trainName: "[STUB] Express Train",
      runDate: options.date,
      currentStation: "[STUB] Delhi Central",
      currentStationCode: "NDLS",
      delayMinutes: 0,
      statusText: "[STUB] On Schedule",
      expectedArrival: new Date(options.date).toISOString(),
      platform: "5",
      raw: {
        note: "This is a stub response. Implement real API integration.",
      },
    };
  }

  /**
   * Fetch PNR status - STUB ONLY
   * Returns mocked passenger and berth information.
   *
   * TODO: Replace with real API call to chosen provider.
   */
  async fetchPnrStatus(options: { pnr: string }): Promise<NormalizedTrain | null> {
    // Input validation
    if (!options.pnr || !/^\d{10}$/.test(options.pnr)) {
      throw new Error("Invalid PNR. Must be exactly 10 digits.");
    }

    // TODO: Call real API endpoint
    // const response = await this.callProviderAPI("pnr_status", options);
    // return mapProviderResponseToNormalized(response);

    // Stub response for now
    return {
      provider: this.providerName,
      pnr: options.pnr,
      passengerName: "[STUB] Passenger Name",
      trainNumber: "[STUB] 12345",
      trainName: "[STUB] Express",
      journey: {
        fromStation: "[STUB] Delhi",
        fromStationCode: "DLI",
        toStation: "[STUB] Mumbai",
        toStationCode: "MUM",
        departureScheduled: new Date().toISOString(),
        arrivalScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      berthInfo: "[STUB] 3A-12",
      bookingStatus: "[STUB] CONFIRMED",
      classOfTravel: "[STUB] 3AC",
      raw: {
        note: "This is a stub response. Implement real API integration.",
      },
    };
  }

  /**
   * Fetch train schedule - STUB ONLY
   * Returns a mocked list of stops.
   *
   * TODO: Replace with real API call to chosen provider.
   */
  async fetchSchedule(options: {
    trainNumber: string;
    date?: string;
  }): Promise<NormalizedTrain[]> {
    // Input validation
    if (!options.trainNumber || !/^\d{4,5}$/.test(options.trainNumber)) {
      throw new Error("Invalid train number. Must be 4-5 digits.");
    }
    if (options.date && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }

    // TODO: Call real API endpoint
    // const response = await this.callProviderAPI("schedule", options);
    // return response.map(stop => mapScheduleStopToNormalized(stop));

    // Stub response: single schedule entry with stops in raw
    const stops: TrainStop[] = [
      {
        station: "[STUB] Delhi Central",
        stationCode: "NDLS",
        sequenceNumber: 1,
        departureScheduled: new Date().toISOString(),
        platform: "5",
      },
      {
        station: "[STUB] Agra",
        stationCode: "AG",
        sequenceNumber: 2,
        arrivalScheduled: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        departureScheduled: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        haltDuration: 30,
      },
      {
        station: "[STUB] Mumbai",
        stationCode: "CSTM",
        sequenceNumber: 3,
        arrivalScheduled: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        platform: "3",
      },
    ];

    return [
      {
        provider: this.providerName,
        trainNumber: options.trainNumber,
        trainName: "[STUB] Express Train",
        runDate: options.date || new Date().toISOString().split("T")[0],
        raw: {
          note: "This is a stub response. Implement real API integration.",
          stops: stops,
        },
      },
    ];
  }

  // TODO for integration engineer:
  // private async callProviderAPI(endpoint: string, params: unknown): Promise<unknown> {
  //   // Call chosen provider's API here
  //   // Handle auth, errors, rate limiting, etc.
  // }
}

/**
 * Factory function to create a stub train provider.
 * Replace this when implementing real provider.
 */
export function createTrainProvider(): ITrainProvider {
  return new StubIndianRailProvider();
}
