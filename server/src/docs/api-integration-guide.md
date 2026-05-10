# Transport Provider API Integration Guide

This guide provides practical examples for integrating transport providers into the Traveloop application.

## Quick Start

### Prerequisites

1. Ensure the backend is running: `npm run dev` in `server/`
2. Check that transport routes are registered in `src/app.ts`
3. For Aviationstack, set `AVIATIONSTACK_API_KEY` in `.env`

### Test Provider Capabilities

```bash
curl http://localhost:3000/api/transport/providers/capabilities
```

---

## Bus Provider Integration

### Overview

The bus provider fetches real-time vehicle positions, trip updates, and service alerts from GTFS-Realtime feeds.

### Setup

1. Find a GTFS-Realtime feed URL
2. Optionally, get authentication credentials if the feed requires auth
3. Set environment variable or pass feedUrl as query parameter

### Finding GTFS-Realtime Feeds

- **Global Directory**: https://transitfeeds.com/
- **India (Delhi)**: Check Delhi Transport Stack or DTC documentation
- **Operators**: Most major transit agencies publish GTFS-Realtime feeds

### Example Usage

#### Fetch Vehicle Positions

**Request**:
```bash
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt"
```

**Response**:
```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "vehicle-1",
      "vehicleId": "DTC-456",
      "tripId": "trip-789",
      "routeId": "route-101",
      "currentStatus": "IN_TRANSIT",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "bearing": 45,
      "speed": 12.5,
      "occupancyStatus": "MANY_SEATS_AVAILABLE",
      "timestamp": "2024-05-10T10:30:00Z"
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

#### Fetch Trip Updates (Delays)

**Request**:
```bash
curl "http://localhost:3000/api/transport/buses/trips?feedUrl=https://feeds.example.com/gtfs-rt"
```

**Response**:
```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "trip-1",
      "tripId": "trip-789",
      "routeId": "route-101",
      "startDate": "20240510",
      "scheduleRelationship": "SCHEDULED",
      "stopSequence": 1,
      "stopId": "stop-456",
      "arrival": {
        "delay": 300,
        "time": "2024-05-10T10:45:00Z"
      },
      "departure": {
        "delay": 0,
        "time": "2024-05-10T10:30:00Z"
      }
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

#### Fetch Service Alerts

**Request**:
```bash
curl "http://localhost:3000/api/transport/buses/alerts?feedUrl=https://feeds.example.com/gtfs-rt"
```

**Response**:
```json
{
  "data": [
    {
      "provider": "gtfs-realtime",
      "entityId": "alert-1",
      "activeStart": "2024-05-10T08:00:00Z",
      "activeEnd": "2024-05-10T18:00:00Z",
      "affectedRoutes": ["route-101"],
      "causeName": "CONSTRUCTION",
      "effectName": "DETOUR",
      "headerText": "Route 101 detoured",
      "descriptionText": "Due to road construction on Main St...",
      "url": "https://transit.example.com/alert/1"
    }
  ],
  "count": 1,
  "provider": "gtfs-realtime"
}
```

### With Authentication

If the feed requires authentication:

```bash
# Bearer token auth
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt&authHeader=Bearer+abc123xyz"

# Basic auth
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt&authHeader=Basic+dXNlcm5hbWU6cGFzc3dvcmQ="
```

### Integration in Application

**TypeScript Example** (frontend calling backend):

```typescript
// services/transportApi.ts
export async function fetchBusVehicles(feedUrl: string) {
  const params = new URLSearchParams({
    feedUrl,
    includeRaw: "false",
  });

  const response = await fetch(
    `http://localhost:3000/api/transport/buses/vehicles?${params}`
  );
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Usage in component
import { useEffect, useState } from "react";
import { fetchBusVehicles } from "../services/transportApi";

export function BusTracker() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBusVehicles("https://feeds.example.com/gtfs-rt")
      .then((data) => setVehicles(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Bus Vehicles ({vehicles.length})</h2>
      {vehicles.map((v) => (
        <div key={v.entityId}>
          <p>Route: {v.routeId} | Vehicle: {v.vehicleId}</p>
          <p>Location: ({v.latitude}, {v.longitude})</p>
          <p>Speed: {v.speed} m/s | Status: {v.currentStatus}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Flight Provider Integration

### Overview

The flight provider fetches real-time flight status and schedules from Aviationstack.

### Setup

1. Create free or paid account at https://aviationstack.com/
2. Get API key from account dashboard
3. Set `AVIATIONSTACK_API_KEY` in `.env` or `server/.env`

### Check Available Endpoints

```bash
curl http://localhost:3000/api/transport/providers/capabilities | grep -A 5 aviationstack
```

### Example Usage

#### Get Flight Status by IATA Code

**Request**:
```bash
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123"
```

**Response**:
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
      "arrivalActual": null,
      "delayMinutes": 0,
      "aircraft": "B777"
    }
  ],
  "count": 1,
  "provider": "aviationstack"
}
```

#### Get All Flights from an Airport

**Request**:
```bash
curl "http://localhost:3000/api/transport/flights/status?depIata=LHR&date=2024-05-10"
```

#### Get Flights with Pagination

**Request**:
```bash
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123&limit=10&offset=0"
```

### Troubleshooting

**Error 501: Not Configured**

```json
{
  "error": "Not Configured",
  "message": "AVIATIONSTACK_API_KEY not set in environment"
}
```

**Solution**: Set `AVIATIONSTACK_API_KEY` in `server/.env`

**Error 401: Unauthorized**

```json
{
  "error": "Unauthorized",
  "message": "Aviationstack: Invalid API key (401)"
}
```

**Solution**: Verify API key is correct at https://aviationstack.com/

**Error 403: Forbidden**

```json
{
  "error": "Forbidden",
  "message": "Access denied (403). Check subscription plan for endpoint availability."
}
```

**Solution**: Some endpoints (e.g., `/schedules`) require higher subscription tier

### Integration in Application

**TypeScript Example**:

```typescript
// services/flightApi.ts
export async function fetchFlightStatus(flightIata: string, date?: string) {
  const params = new URLSearchParams({ flightIata });
  if (date) params.append("date", date);

  const response = await fetch(
    `http://localhost:3000/api/transport/flights/status?${params}`
  );

  if (!response.ok) {
    if (response.status === 501) {
      throw new Error("Flight provider not configured. Set AVIATIONSTACK_API_KEY.");
    }
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// React component
import { useState } from "react";
import { fetchFlightStatus } from "../services/flightApi";

export function FlightTracker() {
  const [flightCode, setFlightCode] = useState("BA123");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await fetchFlightStatus(flightCode);
      setFlights(data.data);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={flightCode}
        onChange={(e) => setFlightCode(e.target.value)}
        placeholder="Enter flight code (e.g., BA123)"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {flights.map((flight) => (
        <div key={flight.flightIata}>
          <h3>{flight.flightIata}</h3>
          <p>
            {flight.departureIata} → {flight.arrivalIata}
          </p>
          <p>Status: {flight.flightStatus}</p>
          <p>
            Departure: {new Date(flight.departureScheduled).toLocaleString()}
          </p>
          {flight.delayMinutes && <p>Delay: {flight.delayMinutes} minutes</p>}
        </div>
      ))}
    </form>
  );
}
```

---

## Train Provider Integration

### Current Status

The train provider is **stubbed only**. It returns mocked responses for testing purposes.

### Example Usage

#### Get Live Train Status

**Request**:
```bash
curl "http://localhost:3000/api/transport/trains/live?trainNumber=12345&date=2024-05-10"
```

**Response** (mocked):
```json
{
  "data": {
    "provider": "indian-rail-stub",
    "trainNumber": "12345",
    "trainName": "[STUB] Express Train",
    "currentStation": "[STUB] Delhi Central",
    "currentStationCode": "NDLS",
    "delayMinutes": 0,
    "statusText": "[STUB] On Schedule",
    "expectedArrival": "2024-05-10T20:00:00Z",
    "raw": {
      "note": "This is a stub response. Implement real API integration."
    }
  },
  "provider": "indian-rail-stub",
  "warning": "This is a stub implementation. Real API integration required."
}
```

#### Get PNR Status

**Request**:
```bash
curl "http://localhost:3000/api/transport/trains/pnr?pnr=1234567890"
```

#### Get Train Schedule

**Request**:
```bash
curl "http://localhost:3000/api/transport/trains/schedule?trainNumber=12345"
```

### Implementing Real Train Provider

To implement a real train provider:

1. Follow [Train Provider Integration Guide](./transport-providers.md#train-provider-integration-guide)
2. Create `RealIndianRailProvider` class
3. Implement mapper functions
4. Update factory function in `trainProvider.interface.ts`
5. Update this guide with real examples

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common Errors

| Scenario | Status | Error | Solution |
|----------|--------|-------|----------|
| Invalid feed URL | 400 | `Bad Request` | Check URL format |
| Auth required but not provided | 401 | `Unauthorized` | Add authHeader parameter |
| Subscription tier too low | 403 | `Forbidden` | Upgrade Aviationstack tier |
| Rate limited | 429 | `Too Many Requests` | Wait or upgrade plan |
| Feed server down | 504 | `Gateway Timeout` | Try later, check feed URL |
| API key not set | 501 | `Not Configured` | Set AVIATIONSTACK_API_KEY |

### Validation Errors

```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": "flightIata",
      "message": "String must match pattern: [A-Z]{2}[0-9]{1,4}"
    }
  ]
}
```

---

## Performance Considerations

### Caching Strategies

**Bus Data** (updates every 30-60 seconds):
```typescript
const CACHE_TTL_BUS = 30 * 1000; // 30 seconds
const busCache = new Map<string, CachedResponse>();

async function getCachedBusVehicles(feedUrl: string) {
  const cached = busCache.get(feedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_BUS) {
    return cached.data;
  }
  const data = await fetchBusVehicles(feedUrl);
  busCache.set(feedUrl, { data, timestamp: Date.now() });
  return data;
}
```

**Flight Data** (updates every 5-30 seconds):
```typescript
const CACHE_TTL_FLIGHT = 20 * 1000; // 20 seconds
// Similar caching pattern
```

### Rate Limit Awareness

- **GTFS-Realtime**: No rate limiting on our end (depends on feed provider)
- **Aviationstack**: Respect subscription tier limits
  - Free: ~16 requests/day
  - Professional: ~1,700 requests/day
  - Business: ~16,500 requests/day

---

## Testing

### Unit Tests

```typescript
// test/providers/bus.test.ts
import { mapVehiclePositionToNormalized } from "../src/providers/bus/gtfsRealtime.mapper";

describe("Bus Provider", () => {
  it("should normalize vehicle position", () => {
    const mockEntity = {
      id: "vehicle-1",
      vehicle: {
        vehicle: { id: "DTC-123" },
        trip: { trip_id: "trip-1", route_id: "route-1" },
        position: { latitude: 28.7, longitude: 77.1 },
        current_status: "IN_TRANSIT",
        timestamp: "1715339400",
      },
    };

    const result = mapVehiclePositionToNormalized(mockEntity, "gtfs-realtime");
    expect(result.vehicleId).toBe("DTC-123");
    expect(result.latitude).toBe(28.7);
  });
});
```

### Integration Tests

```typescript
// test/api/transport.test.ts
import request from "supertest";
import { app } from "../src/app";

describe("Transport API", () => {
  it("should return provider capabilities", async () => {
    const res = await request(app).get("/api/transport/providers/capabilities");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it("should return 400 for missing feedUrl", async () => {
    const res = await request(app).get("/api/transport/buses/vehicles");
    expect(res.status).toBe(400);
  });
});
```

---

## Next Steps

1. **Bus Integration**: Find a GTFS-Realtime feed and integrate into trip planning
2. **Flight Integration**: Set up Aviationstack account and add flight tracking
3. **Train Integration**: Research and implement real train provider
4. **Caching**: Add Redis or in-memory caching for improved performance
5. **Monitoring**: Add observability for provider API calls (logs, metrics, alerts)
6. **Testing**: Add comprehensive unit and integration tests

