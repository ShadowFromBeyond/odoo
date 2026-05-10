# Transport Provider Capability Matrix

This matrix summarizes the capabilities, status, and requirements of all supported transport providers.

## Providers Overview

| Provider | Mode | Real-time | Auth | Status | Endpoints |
|----------|------|-----------|------|--------|-----------|
| GTFS-Realtime | Bus | ✅ Yes | ⚙️ Optional | ✅ Implemented | 3 |
| Aviationstack | Flight | ✅ Yes | 🔒 Required | ✅ Implemented | 2 |
| Indian Rail | Train | ❌ No | - | 🟡 Stubbed | 3 |

---

## Detailed Comparison

### 1. GTFS-Realtime (Bus)

#### Capabilities

| Feature | Support | Notes |
|---------|---------|-------|
| Vehicle Positions | ✅ | Real-time location, speed, bearing |
| Trip Updates | ✅ | Schedule deviations, delays, stop sequences |
| Service Alerts | ✅ | Disruptions, advisories, active periods |
| Route Information | ✅ | Route ID, direction |
| Stop Information | ✅ | Stop ID, sequence, timings |
| Occupancy | ⚙️ Partial | Only if feed provides |
| Predictions | ⚙️ Partial | Arrival/departure time estimates |
| Historical Data | ❌ | Real-time only |

#### Requirements

| Item | Value |
|------|-------|
| **Authentication** | Optional (depends on feed) |
| **Authorization Headers** | Supported (Basic, Bearer) |
| **Base URL** | Feed-specific (pass `feedUrl` param) |
| **Data Format** | Protobuf (binary) or JSON |
| **Rate Limits** | Feed-specific (typically none) |
| **Cost** | Free (varies by operator) |

#### Supported Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `feedUrl` | string | Yes | GTFS-Realtime feed URL |
| `authHeader` | string | No | Authorization header value |
| `routeId` | string | No | Filter by route (future) |
| `includeRaw` | boolean | No | Include raw payload in response |

#### Example Requests

**Vehicle Positions**:
```bash
GET /api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt
```

**With Authorization**:
```bash
GET /api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt&authHeader=Bearer+token123
```

#### Limitations

- Binary protobuf parsing requires library integration (not yet implemented)
- Feed availability and update frequency varies by operator
- Some fields optional depending on feed
- No rate limiting applied (but feed may have limits)
- Entity types (vehicle, trip, alert) may not all be present in a feed

#### Environment Setup

```bash
# Optional: if you have a default GTFS-RT feed URL
GTFS_REALTIME_FEED_URL=https://feeds.example.com/gtfs-rt
```

#### Known Transit Operators with GTFS-RT

- Delhi DTC/DIMTS (India) - May require authorization
- Many international transit agencies
- Check https://transitfeeds.com/ for operator feeds

---

### 2. Aviationstack (Flight)

#### Capabilities

| Feature | Support | Notes |
|---------|---------|-------|
| Flight Status | ✅ | Active, scheduled, landed, cancelled, delayed |
| Real-time Position | ✅ | Latitude, longitude, altitude, speed (active flights only) |
| Departure Times | ✅ | Scheduled, estimated, actual |
| Arrival Times | ✅ | Scheduled, estimated, actual |
| Terminal/Gate | ✅ | If available in feed |
| Delay Information | ✅ | Calculated in minutes |
| Aircraft Type | ✅ | IATA/ICAO codes and names |
| Baggage Info | ⚙️ Partial | May not be available |
| Schedule History | ⚙️ Partial | Available only in certain tiers |
| Codeshare Flights | ✅ | If applicable |

#### Requirements

| Item | Value |
|------|-------|
| **Authentication** | Required (API key) |
| **Base URL** | https://api.aviationstack.com/v1 |
| **API Key** | From https://aviationstack.com/ |
| **Data Format** | JSON |
| **Rate Limits** | Depends on subscription tier |
| **Cost** | Free tier or paid subscriptions |
| **Subscription Level** | Free, Professional, Business, Enterprise |

#### Supported Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `flightIata` | string | Yes* | Flight IATA code (e.g., "BA123") |
| `flightIcao` | string | Yes* | Flight ICAO code |
| `depIata` | string | No | Departure airport IATA (filter) |
| `arrIata` | string | No | Arrival airport IATA (filter) |
| `date` | string | No | Flight date (YYYY-MM-DD) |
| `limit` | number | No | Result limit (1-100, default 100) |
| `offset` | number | No | Pagination offset |

*At least one of `flightIata` or `flightIcao` is required.

#### Example Requests

**Get Flight Status**:
```bash
GET /api/transport/flights/status?flightIata=BA123&date=2024-05-10
```

**Get All Departures from an Airport**:
```bash
GET /api/transport/flights/status?depIata=LHR&date=2024-05-10
```

**Pagination**:
```bash
GET /api/transport/flights/status?flightIata=BA123&limit=50&offset=0
```

#### Limitations

- Requires API key (free tier with daily/monthly limits)
- Schedule endpoint may not be available in free tier
- Some fields (terminal, gate, aircraft) may be null
- Live position only for active flights
- Rate limits depend on subscription tier
- May not have historical data beyond certain period

#### Environment Setup

```bash
# Get API key from https://aviationstack.com/
AVIATIONSTACK_API_KEY=your_api_key_here
```

#### Subscription Tier Comparison

| Feature | Free | Professional | Business |
|---------|------|--------------|----------|
| Requests/Month | 500 | 50,000 | 500,000 |
| Flight Status | ✅ | ✅ | ✅ |
| Schedules | ❌ | ✅ | ✅ |
| Real-time Position | ❌ | ✅ | ✅ |
| API Support | ❌ | ✅ | ✅ |

---

### 3. Indian Rail (Train) - STUBBED

#### Capabilities

| Feature | Support | Notes |
|---------|---------|-------|
| Live Train Status | 🟡 Stubbed | Returns mocked data only |
| PNR Status | 🟡 Stubbed | Returns mocked data only |
| Schedule | 🟡 Stubbed | Returns mocked data only |
| Real-time Position | ❌ | Not implemented |
| Delay Information | 🟡 Stubbed | Mocked only |
| Booking Status | 🟡 Stubbed | Mocked only |

#### Status

**Current**: Stubbed (no external API integration)

**Reason**: Indian Railways does not publish official public real-time APIs. Third-party providers exist (IndianRailAPI, RailAPI, etc.) but require individual evaluation and setup.

#### What the Stub Does

- ✅ Validates input (train number format, PNR format, date format)
- ✅ Returns typed responses matching `NormalizedTrain` schema
- ❌ Does not call any external API
- ❌ Does not return real data

#### What the Integration Engineer Needs to Do

1. **Research**: Evaluate available train API providers
2. **Licensing**: Review ToS and ensure compliance
3. **Credentials**: Sign up and obtain API key
4. **Implementation**: Create real provider class
5. **Testing**: Unit and integration tests
6. **Documentation**: Update this guide with real provider details

#### Recommended Next Steps

See [Train Provider Integration Guide](./transport-providers.md#train-provider-integration-guide) in main documentation.

#### Placeholder Environment Variables

```bash
# Not needed yet - for future real implementation
# TRAIN_PROVIDER_API_KEY=...
# TRAIN_PROVIDER_BASE_URL=...
```

#### Known Train API Providers

| Provider | Website | Features | Cost |
|----------|---------|----------|------|
| IndianRailAPI | https://indianrailapi.com | Live status, PNR, Schedule | Free + Paid |
| RailAPI | Various | Varies | Varies |
| Official Data (if available) | Indian Railways | Official source | Unknown |

---

## Feature Comparison Table

| Feature | Bus (GTFS-RT) | Flight (Aviationstack) | Train (Stub) |
|---------|---------------|----------------------|-------------|
| Real-time Data | ✅ | ✅ | ❌ |
| Historical Data | ❌ | ⚙️ Partial | ❌ |
| Authentication | ⚙️ Optional | 🔒 Required | - |
| Update Frequency | ~30-60s | ~5-30s | - |
| Cost | Free | Free/Paid | - |
| Implementation Status | ✅ Implemented | ✅ Implemented | 🟡 Stubbed |
| Endpoint Count | 3 | 2 | 3 |
| Geographic Coverage | Global (operators) | Global | India |

---

## Response Field Availability

### Bus Vehicle Fields

| Field | Always | Usually | Optional | Notes |
|-------|--------|---------|----------|-------|
| provider | ✅ | | | Always set |
| entityId | ✅ | | | From GTFS-RT feed |
| vehicleId | | ⚙️ | | Depends on feed |
| tripId | | ⚙️ | | Depends on feed |
| routeId | | ⚙️ | | Depends on feed |
| latitude | | ✅ | | From position entity |
| longitude | | ✅ | | From position entity |
| bearing | | | ⚙️ | Optional bearing |
| speed | | | ⚙️ | Optional speed |
| timestamp | | ✅ | | Update timestamp |

### Flight Status Fields

| Field | Always | Usually | Optional | Notes |
|-------|--------|---------|----------|-------|
| provider | ✅ | | | Always set |
| flightStatus | ✅ | | | Active, scheduled, etc. |
| airlineIata | ✅ | | | Airline code |
| flightNumber | ✅ | | | Without airline prefix |
| departureIata | ✅ | | | Airport code |
| arrivalIata | ✅ | | | Airport code |
| departureScheduled | ✅ | | | Scheduled time |
| arrivalScheduled | ✅ | | | Scheduled time |
| departureActual | | ⚙️ | | Only if departed |
| arrivalActual | | | ⚙️ | Only if arrived |
| aircraft | | ⚙️ | | Aircraft type |
| terminal | | | ⚙️ | If available |
| gate | | | ⚙️ | If available |

---

## API Error Responses

### Common HTTP Status Codes

| Status | Meaning | Provider | Resolution |
|--------|---------|----------|------------|
| 200 | Success | All | Check response data |
| 400 | Bad Request | All | Validate query parameters |
| 401 | Unauthorized | Aviationstack | Check API key |
| 403 | Forbidden | Aviationstack | Check subscription tier |
| 404 | Not Found | All | Resource doesn't exist |
| 429 | Rate Limited | Aviationstack | Wait or upgrade tier |
| 500 | Server Error | All | Check provider status |
| 501 | Not Implemented | Train (trains) | Expected (stub only) |
| 504 | Timeout | All | Increase timeout or check network |

---

## Performance and Rate Limits

### GTFS-Realtime

- **Latency**: Typically < 500ms from feed to response
- **Update Frequency**: 20-60 seconds (varies by operator)
- **Rate Limits**: None applied by our service; check feed provider
- **Data Size**: Varies; typical feed 1-10 MB protobuf

### Aviationstack

- **Latency**: Typically 200-800ms from API to response
- **Update Frequency**: 5-30 seconds depending on flight status
- **Rate Limits**:
  - Free: 500/month (~16/day)
  - Professional: 50,000/month (~1,700/day)
  - Business: 500,000/month (~16,500/day)
- **Concurrent Requests**: Varies by tier
- **Data Caching**: Consider caching responses (flights don't change rapidly)

### Train (Stub)

- **Latency**: < 50ms (mock responses)
- **Rate Limits**: None (no real API)
- **Data Size**: Negligible

---

## Monitoring and Debugging

### Check Provider Status

```bash
GET /api/transport/providers/capabilities
```

Returns detailed status of all providers.

### Enable Raw Payloads

Add `includeRaw=true` to any request:

```bash
GET /api/transport/buses/vehicles?feedUrl=...&includeRaw=true
```

Responses will include a `raw` field with provider-specific payload samples for debugging.

### Common Issues and Solutions

| Issue | Provider | Solution |
|-------|----------|----------|
| Timeout | GTFS-RT | Increase timeout, check feed URL, check network |
| No data | GTFS-RT | Check feedUrl is correct, validate feed format |
| 401 Unauthorized | Aviationstack | Check AVIATIONSTACK_API_KEY |
| 403 Forbidden | Aviationstack | Check subscription tier for endpoint |
| 429 Rate Limited | Aviationstack | Wait, cache responses, upgrade tier |
| Stub responses | Train | Expected; implement real provider |

---

## Future Enhancements

### Planned Features

- [ ] Protobuf parsing for GTFS-Realtime feeds
- [ ] Caching layer for improved performance
- [ ] Batch query support
- [ ] Real train provider implementation
- [ ] WebSocket support for real-time streaming
- [ ] Historical data aggregation

### Possible Additional Providers

- Taxi/Ride-sharing (Uber, Lyft APIs)
- Logistics (package tracking)
- Weather (for travel planning)
- Road conditions (traffic APIs)

