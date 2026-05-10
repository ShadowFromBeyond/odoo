# Transport Providers Documentation

This document describes the backend transport provider service layer for Traveloop. The service layer exposes real-time and schedule data for buses, flights, and trains through a normalized interface.

## Overview

The transport provider system is designed to:

- **Fetch real-time data** from multiple external providers
- **Normalize responses** into a common schema for application consumption
- **Separate concerns** between provider-specific logic and application logic
- **Support easy provider swapping** without changing application code
- **Provide clear integration points** for future provider additions

## Supported Providers

### 1. Bus: GTFS-Realtime

**Status**: Implemented

**Provider**: GTFS-Realtime (generic specification-based adapter)

**Real-time Support**: Yes

**Authentication**: Optional (depends on feed provider)

**Description**:

GTFS-Realtime is an open specification for real-time transit data. It is widely adopted by public transit agencies worldwide, including some Indian transit operators like Delhi DTC and DIMTS.

The adapter fetches and parses GTFS-Realtime protobuf feeds and normalizes the response into a common bus schema.

**Supported Endpoints**:
- Vehicle positions (current location, speed, bearing)
- Trip updates (delays, schedule changes)
- Service alerts (disruptions, advisories)

**Limitations**:

- GTFS-Realtime feeds are specification-driven; not all operators provide all entity types.
- Some feeds require authentication (API key, Bearer token, or Basic auth).
- Binary protobuf parsing requires the `protobufjs` library.
- Feeds are typically updated every 20-60 seconds depending on operator.

**Documentation**:
- [GTFS-Realtime Reference](https://gtfs.org/documentation/realtime/reference/)
- [GTFS-Realtime Examples](https://developers.google.com/transit/gtfs-realtime/examples/vehicle-positions)

---

### 2. Flight: Aviationstack

**Status**: Implemented

**Provider**: Aviationstack (commercial provider)

**Real-time Support**: Yes (for active flights)

**Authentication**: Required (API key)

**Description**:

Aviationstack is a commercial aviation data API. It provides real-time flight status, schedule data, aircraft position (for active flights), departure/arrival times, terminal/gate information, delays, and more.

The adapter queries the Aviationstack API and normalizes responses into a common flight schema.

**Supported Endpoints**:
- Flight status (real-time status for active flights)
- Flight schedules (future and past flight schedules, if available in subscription)

**Limitations**:

- Requires active Aviationstack subscription (free tier with limited requests available).
- API key must be set in environment (`AVIATIONSTACK_API_KEY`).
- Some endpoints (e.g., schedules) may only be available in higher-tier subscriptions.
- Rate limits depend on subscription tier.
- Live aircraft position data only available for active flights.

**Documentation**:
- [Aviationstack API Documentation](https://aviationstack.com/documentation)

---

### 3. Train: Placeholder Interface (Stub Only)

**Status**: Stubbed (no real external integration)

**Provider**: Indian Rail (placeholder)

**Real-time Support**: Intended (not implemented)

**Authentication**: Not applicable (stub only)

**Description**:

Train data integration is not fully implemented. A `TrainProvider` interface and `StubIndianRailProvider` are provided to define the contract for a future integration engineer.

The stub returns mocked responses only. **No real API calls are made**.

**Why Stubbed**:

- Indian Railways does not publish official public real-time APIs in the same way as GTFS-Realtime.
- Third-party train APIs (IndianRailAPI, RailwayAPI, etc.) exist but require individual evaluation, licensing review, and subscription setup.
- Integration engineer needs to research, select, and verify compliance before integrating a real provider.

**Next Steps**:

See [Train Provider Integration Guide](#train-provider-integration-guide) below.

---

## HTTP Endpoints

All endpoints are read-only (GET) and return normalized responses. No authentication is required (can be added if needed).

### Base URL

```
http://localhost:3000/api/transport
```

### Bus Endpoints

#### GET /buses/vehicles

Fetch vehicle positions from a GTFS-Realtime feed.

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `feedUrl` | string | Yes | URL to GTFS-Realtime feed (JSON or protobuf) |
| `authHeader` | string | No | Authorization header (e.g., `Bearer token` or `Basic base64`) |
| `routeId` | string | No | Filter by route ID (optional) |
| `includeRaw` | string | No | Include raw provider payload (`true` or `false`) |

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt&includeRaw=true"
```

**Example Response**:

```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "vehicle-123",
      "vehicleId": "DTC-456",
      "tripId": "trip-789",
      "routeId": "route-101",
      "currentStatus": "IN_TRANSIT",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "bearing": 45,
      "speed": 12.5,
      "occupancyStatus": "MANY_SEATS_AVAILABLE",
      "timestamp": "2024-05-10T10:30:00Z",
      "raw": {
        "vehicle_id": "DTC-456",
        "trip_id": "trip-789"
      }
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

---

#### GET /buses/trips

Fetch trip updates (schedule deviations, delays) from a GTFS-Realtime feed.

**Query Parameters**: Same as `/buses/vehicles`

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/buses/trips?feedUrl=https://feeds.example.com/gtfs-rt"
```

**Example Response**:

```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "trip-123",
      "tripId": "trip-789",
      "routeId": "route-101",
      "startDate": "20240510",
      "scheduleRelationship": "SCHEDULED",
      "stopSequence": 1,
      "stopId": "stop-456",
      "arrival": {
        "delay": 300,
        "time": "2024-05-10T10:45:00Z",
        "uncertainty": 0
      },
      "departure": {
        "delay": 0,
        "time": "2024-05-10T10:30:00Z"
      },
      "timestamp": "2024-05-10T10:29:00Z"
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

---

#### GET /buses/alerts

Fetch service alerts (disruptions, advisories) from a GTFS-Realtime feed.

**Query Parameters**: Same as `/buses/vehicles`

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/buses/alerts?feedUrl=https://feeds.example.com/gtfs-rt"
```

**Example Response**:

```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "alert-123",
      "activeStart": "2024-05-10T08:00:00Z",
      "activeEnd": "2024-05-10T18:00:00Z",
      "affectedRoutes": ["route-101", "route-102"],
      "affectedStops": ["stop-456"],
      "causeName": "CONSTRUCTION",
      "effectName": "DETOUR",
      "headerText": "Route 101 temporarily detoured",
      "descriptionText": "Due to road construction...",
      "url": "https://transit.example.com/alert/123"
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

---

### Flight Endpoints

#### GET /flights/status

Fetch real-time flight status from Aviationstack.

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `flightIata` | string | No* | Flight IATA code (e.g., `BA123`) |
| `flightIcao` | string | No* | Flight ICAO code |
| `depIata` | string | No | Departure airport IATA (filter) |
| `arrIata` | string | No | Arrival airport IATA (filter) |
| `date` | string | No | Flight date (YYYY-MM-DD) |
| `limit` | number | No | Result limit (1-100, default 100) |
| `offset` | number | No | Pagination offset |
| `includeRaw` | string | No | Include raw provider payload |

*At least one of `flightIata` or `flightIcao` is required.

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123&date=2024-05-10"
```

**Example Response**:

```json
{
  "data": [
    {
      "provider": "aviationstack",
      "flightDate": "2024-05-10",
      "flightStatus": "scheduled",
      "airlineName": "British Airways",
      "airlineIata": "BA",
      "flightNumber": "123",
      "flightIata": "BA123",
      "departureAirport": "Heathrow",
      "departureIata": "LHR",
      "departureTerminal": "3",
      "departureGate": "A12",
      "departureScheduled": "2024-05-10T14:00:00Z",
      "departureActual": null,
      "arrivalAirport": "Delhi Indira Gandhi",
      "arrivalIata": "DEL",
      "arrivalTerminal": "3",
      "arrivalScheduled": "2024-05-11T02:30:00Z",
      "delayMinutes": 0,
      "aircraft": "B777"
    }
  ],
  "count": 1,
  "provider": "aviationstack"
}
```

---

#### GET /flights/schedules

Fetch flight schedules from Aviationstack (if available in subscription).

**Query Parameters**: Same as `/flights/status`

**Note**: This endpoint may return HTTP 501 or 403 if not available in your Aviationstack subscription tier.

---

### Train Endpoints (Stub)

#### GET /trains/live

Fetch live train status (stub only - returns mocked response).

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `trainNumber` | string | Yes | Train number (4-5 digits) |
| `date` | string | Yes | Date (YYYY-MM-DD) |

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/trains/live?trainNumber=12345&date=2024-05-10"
```

**Example Response**:

```json
{
  "data": {
    "provider": "indian-rail-stub",
    "trainNumber": "12345",
    "currentStation": "[STUB] Delhi Central",
    "currentStationCode": "NDLS",
    "delayMinutes": 0,
    "statusText": "[STUB] On Schedule",
    "expectedArrival": "2024-05-10T20:00:00Z"
  },
  "provider": "indian-rail-stub",
  "warning": "This is a stub implementation. Real API integration required."
}
```

---

#### GET /trains/pnr

Fetch train PNR (Passenger Name Record) status (stub only).

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pnr` | string | Yes | PNR (10 digits) |

**Example Request**:

```bash
curl "http://localhost:3000/api/transport/trains/pnr?pnr=1234567890"
```

---

#### GET /trains/schedule

Fetch train schedule (stub only).

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `trainNumber` | string | Yes | Train number (4-5 digits) |
| `date` | string | No | Date (YYYY-MM-DD) |

---

### Provider Info

#### GET /providers/capabilities

Describe capabilities and status of all supported providers.

**Example Response**:

```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "mode": "bus",
      "realtimeSupport": true,
      "authRequired": false,
      "status": "implemented",
      "endpoints": [
        "/api/transport/buses/vehicles",
        "/api/transport/buses/trips",
        "/api/transport/buses/alerts"
      ],
      "requiredEnv": ["GTFS_REALTIME_FEED_URL"],
      "notes": "GTFS-Realtime is specification-driven..."
    },
    {
      "provider": "aviationstack",
      "mode": "flight",
      "realtimeSupport": true,
      "authRequired": true,
      "status": "implemented",
      "endpoints": ["/api/transport/flights/status"],
      "requiredEnv": ["AVIATIONSTACK_API_KEY"],
      "notes": "Commercial provider. Requires active subscription..."
    },
    {
      "provider": "indian-rail-stub",
      "mode": "train",
      "realtimeSupport": false,
      "authRequired": false,
      "status": "stubbed",
      "endpoints": [
        "/api/transport/trains/live",
        "/api/transport/trains/pnr",
        "/api/transport/trains/schedule"
      ],
      "requiredEnv": [],
      "notes": "Stub only. Integration engineer must implement real provider..."
    }
  ],
  "count": 3
}
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```bash
# Bus (GTFS-Realtime)
# Leave blank or set to your feed URL if known
GTFS_REALTIME_FEED_URL=https://feeds.example.com/gtfs-rt

# Flight (Aviationstack)
# Get API key from https://aviationstack.com/
AVIATIONSTACK_API_KEY=your_api_key_here

# Train (future integration)
# Not needed yet - placeholder for future train provider
# TRAIN_PROVIDER_API_KEY=...
# TRAIN_PROVIDER_BASE_URL=...
```

See `.env.example` for a complete template.

---

## Normalized Response Schemas

All provider responses are normalized into common schemas. This allows the application to consume data uniformly, regardless of the underlying provider.

### Bus Vehicle Schema

```typescript
interface NormalizedBusVehicle {
  provider: string;           // "gtfs-realtime"
  entityId: string;           // Unique entity ID from feed
  vehicleId?: string;         // Vehicle registration/ID
  tripId?: string;            // GTFS trip_id
  routeId?: string;           // GTFS route_id
  currentStatus?: string;     // "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT"
  latitude?: number;
  longitude?: number;
  bearing?: number;           // Compass bearing (0-360)
  speed?: number;             // Speed in m/s
  occupancyStatus?: string;   // e.g., "MANY_SEATS_AVAILABLE"
  timestamp?: string;         // ISO 8601
  raw?: Record<string, any>;  // Original payload subset (if requested)
}
```

### Flight Schema

```typescript
interface NormalizedFlight {
  provider: string;               // "aviationstack"
  flightDate?: string;            // YYYY-MM-DD
  flightStatus?: string;          // "scheduled", "active", "landed", etc.
  airlineName?: string;
  airlineIata?: string;
  flightNumber?: string;          // Without airline prefix
  flightIata?: string;            // Full identifier (e.g., "BA123")
  departureAirport?: string;
  departureIata?: string;
  departureTerminal?: string;
  departureGate?: string;
  departureScheduled?: string;    // ISO 8601
  departureActual?: string;       // ISO 8601
  arrivalAirport?: string;
  arrivalIata?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  arrivalScheduled?: string;      // ISO 8601
  arrivalActual?: string;         // ISO 8601
  delayMinutes?: number;
  aircraft?: string;              // Aircraft type code
  raw?: Record<string, any>;      // Original payload subset (if requested)
}
```

### Train Schema

```typescript
interface NormalizedTrain {
  provider: string;                   // "indian-rail-stub" or real provider
  trainNumber?: string;
  trainName?: string;
  runDate?: string;                   // YYYY-MM-DD
  currentStation?: string;
  currentStationCode?: string;
  delayMinutes?: number;
  statusText?: string;
  expectedArrival?: string;           // ISO 8601
  expectedDeparture?: string;         // ISO 8601
  platform?: string;
  pnr?: string;                       // For PNR queries
  berthInfo?: string;
  classOfTravel?: string;
  passengerName?: string;
  bookingStatus?: string;
  journey?: {
    fromStation?: string;
    fromStationCode?: string;
    toStation?: string;
    toStationCode?: string;
    departureScheduled?: string;
    arrivalScheduled?: string;
  };
  raw?: Record<string, any>;          // Original payload subset
}
```

---

## Known Limitations

### GTFS-Realtime

- **Protobuf Parsing**: Currently expects JSON format. Implement protobuf parsing for binary feeds using `protobufjs` library.
- **Feed Variability**: Different operators provide different entity types and field values. Some feeds may not have vehicle positions, only trip updates.
- **Authorization**: Some feeds require authentication. Pass auth headers via the `authHeader` query parameter.
- **Update Frequency**: Feeds vary in update frequency (20-60 seconds typical). No guarantee of consistent updates.
- **Rate Limits**: Fetching feeds does not incur rate limiting on our end, but feed providers may have limits.

### Aviationstack

- **Subscription Required**: Requires paid or free-tier Aviationstack account.
- **API Key Management**: Store API key securely in environment. Never commit to code.
- **Rate Limits**: Depends on subscription tier. Check Aviationstack documentation.
- **Optional Fields**: Many fields (terminal, gate, aircraft) may be null for some flights or subscription tiers.
- **Schedules Endpoint**: May not be available in free tier. Check your plan.
- **Live Position**: Only available for active flights. Historical flights will have null values for `live.*` fields.

### Train (Stub)

- **No Real Integration**: Returns mocked responses only.
- **No External Calls**: Does not call any external API.
- **Validation Only**: Input validation is performed (train number, PNR format, date).

---

## Train Provider Integration Guide

The train provider is currently stubbed. To integrate a real provider, follow these steps:

### Step 1: Research and Select Provider

Evaluate these options:

- **IndianRailAPI** (https://indianrailapi.com/)
  - Offers live train status, PNR status, schedule queries
  - Requires subscription (paid plans available)
  - Free tier available with limited requests
  - API key or OAuth auth

- **RailAPI** or other third-party vendors
  - Evaluate ToS and compliance requirements
  - Check data accuracy and update frequency

- **Official Indian Railways Data**
  - No official public real-time API currently available
  - May be available through private partnerships

### Step 2: Verify Compliance and Licensing

- Review provider's Terms of Service
- Ensure data usage is permitted in your application
- Check if commercial use requires special license
- Document any restrictions

### Step 3: Setup Provider Account and Credentials

- Sign up for account (free tier or paid)
- Generate API key or setup OAuth
- Note base URL and rate limits
- Add credentials to `.env` and `.env.example`

### Step 4: Implement Real Provider

Create a new file `server/src/providers/trains/realIndianRailProvider.ts`:

```typescript
import { ITrainProvider } from "./trainProvider.interface.js";
import type { NormalizedTrain } from "../../schemas/normalizedTransport.schemas.js";

export class RealIndianRailProvider implements ITrainProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async fetchLiveStatus(options: {
    trainNumber: string;
    date: string;
  }): Promise<NormalizedTrain | null> {
    // TODO: Call real API
    // 1. Build request URL with parameters
    // 2. Add authentication headers
    // 3. Handle provider-specific response format
    // 4. Map response to NormalizedTrain using mapper
    // 5. Handle errors gracefully
  }

  async fetchPnrStatus(options: {
    pnr: string;
  }): Promise<NormalizedTrain | null> {
    // TODO: Implement
  }

  async fetchSchedule(options: {
    trainNumber: string;
    date?: string;
  }): Promise<NormalizedTrain[]> {
    // TODO: Implement
  }
}
```

### Step 5: Create Provider-Specific Mapper

Create `server/src/providers/trains/realIndianRailProvider.mapper.ts`:

```typescript
import type { NormalizedTrain } from "../../schemas/normalizedTransport.schemas.js";

// TODO: Create mapping functions from provider response to NormalizedTrain
// Example:
export function mapProviderResponseToNormalized(
  response: unknown,
  provider: string
): NormalizedTrain {
  // Convert provider-specific fields to normalized schema
}
```

### Step 6: Update Factory Function

Update `server/src/providers/trains/trainProvider.interface.ts`:

```typescript
export function createTrainProvider(): ITrainProvider {
  const apiKey = process.env.TRAIN_PROVIDER_API_KEY;
  const baseUrl = process.env.TRAIN_PROVIDER_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("Train provider credentials not configured");
  }

  // Replace StubIndianRailProvider with RealIndianRailProvider
  return new RealIndianRailProvider(apiKey, baseUrl);
}
```

### Step 7: Test Integration

- Unit test mapper functions with sample API responses
- Integration test with real API (if permitted)
- Validate normalized schema compliance
- Test error handling and edge cases

### Step 8: Document Provider

Update this document with:
- Real provider name and URL
- Authentication requirements
- Rate limits and quotas
- Known limitations and quirks
- Example requests/responses

---

## Troubleshooting

### GTFS-Realtime Feed Returns Binary Protobuf

Error: `Binary GTFS-Realtime protobuf parsing not yet implemented`

**Solution**:
1. Install protobuf parsing library: `npm install protobufjs transit-realtime`
2. Implement protobuf parsing in `gtfsRealtimeBusProvider.ts`
3. Example: https://github.com/MobilityData/gtfs-realtime.js

### Aviationstack API Returns 401 Unauthorized

Error: `Aviationstack: Invalid API key (401)`

**Solution**:
1. Check `AVIATIONSTACK_API_KEY` is set in `.env`
2. Verify API key is valid and not expired
3. Log in to Aviationstack dashboard to regenerate key if needed

### Aviationstack Returns 403 Forbidden

Error: `Access denied (403). Check subscription plan for endpoint availability`

**Solution**:
1. The endpoint (e.g., `/schedules`) may not be available in your subscription tier
2. Upgrade to higher tier or contact Aviationstack support
3. Check https://aviationstack.com/documentation for tier comparison

### GTFS Feed Timeout

Error: `Request timeout after 10000ms`

**Solution**:
1. Increase timeout via provider options: `timeout: 20000`
2. Check if feed URL is accessible from your network
3. Check if feed provider is experiencing downtime
4. Test feed URL manually in browser: `curl -H "Accept: application/json" <feedUrl>`

### Train Provider Always Returns Stub Data

**This is expected**. The train provider is intentionally stubbed. Follow the [Train Provider Integration Guide](#train-provider-integration-guide) to implement a real provider.

---

## Testing

### Unit Tests

Each provider includes pure mapper functions suitable for unit testing:

```typescript
// Example: Test bus vehicle mapper
import { mapVehiclePositionToNormalized } from "../providers/bus/gtfsRealtime.mapper";

describe("GTFS-Realtime Mapper", () => {
  it("should map vehicle position to normalized schema", () => {
    const mockEntity = {
      id: "vehicle-1",
      vehicle: {
        vehicle: { id: "DTC-123" },
        trip: { trip_id: "trip-1", route_id: "route-1" },
        position: { latitude: 28.7041, longitude: 77.1025 },
        current_status: "IN_TRANSIT",
        timestamp: "1715339400", // Unix timestamp
      },
    };

    const result = mapVehiclePositionToNormalized(mockEntity, "gtfs-realtime");
    expect(result).toHaveProperty("vehicleId", "DTC-123");
    expect(result).toHaveProperty("latitude", 28.7041);
  });
});
```

### Integration Tests

Test with real (or mocked) external APIs:

```typescript
// Example: Test GTFS-Realtime provider
describe("GTFS-Realtime Provider", () => {
  it("should fetch vehicle positions from feed", async () => {
    const provider = createGtfsRealtimeBusProvider({
      feedUrl: "https://test-feed.example.com/gtfs-rt",
    });

    const vehicles = await provider.fetchVehiclePositions();
    expect(Array.isArray(vehicles)).toBe(true);
  });
});
```

---

## Additional Resources

- [GTFS Documentation](https://gtfs.org/)
- [GTFS-Realtime Reference](https://gtfs.org/documentation/realtime/reference/)
- [Aviationstack Documentation](https://aviationstack.com/documentation)
- [IndianRailAPI](https://indianrailapi.com/)
- [Zod Validation Library](https://zod.dev/)

