# Quick Reference - Transport Providers API

**TL;DR** - Essential info for using the transport providers backend.

## Files You Need to Know

| File | Purpose |
|------|---------|
| `server/src/providers/` | Provider implementations |
| `server/src/schemas/normalizedTransport.schemas.ts` | Normalized schemas (source of truth) |
| `server/src/controllers/transportController.ts` | HTTP handlers |
| `server/src/routes/transportRoutes.ts` | Routes |
| `server/src/docs/` | All documentation |
| `server/.env.example` | Environment template |

## Quick Test

```bash
# Start server
cd server && npm run dev

# Check endpoints are working
curl http://localhost:3000/api/transport/providers/capabilities

# Test bus endpoint (needs feed URL)
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt"

# Test flight endpoint (needs API key)
export AVIATIONSTACK_API_KEY=your_key
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123"

# Test train endpoint (returns stub data)
curl "http://localhost:3000/api/transport/trains/live?trainNumber=12345&date=2024-05-10"
```

## API Endpoints

### Bus (GTFS-Realtime)
```
GET /api/transport/buses/vehicles?feedUrl=...&authHeader=...
GET /api/transport/buses/trips?feedUrl=...
GET /api/transport/buses/alerts?feedUrl=...
```

### Flight (Aviationstack)
```
GET /api/transport/flights/status?flightIata=BA123
GET /api/transport/flights/schedules?flightIata=BA123
```

### Train (Stub - needs real implementation)
```
GET /api/transport/trains/live?trainNumber=12345&date=2024-05-10
GET /api/transport/trains/pnr?pnr=1234567890
GET /api/transport/trains/schedule?trainNumber=12345
```

### Info
```
GET /api/transport/providers/capabilities
```

## Configuration

### Aviationstack (Flight)
```bash
# 1. Sign up at https://aviationstack.com/
# 2. Copy API key
# 3. Set in server/.env
AVIATIONSTACK_API_KEY=your_api_key_here
```

### GTFS-Realtime (Bus)
```bash
# 1. Find feed at https://transitfeeds.com/
# 2. Pass feedUrl as query parameter (no env var needed)
# OR set in .env
GTFS_REALTIME_FEED_URL=https://feeds.example.com/gtfs-rt
```

### Train (Future)
```bash
# Not needed yet - integrate real provider later
```

## Normalized Schemas

Every response has these fields:

**Bus**:
```json
{
  "provider": "gtfs-realtime",
  "entityId": "...",
  "vehicleId": "...",
  "tripId": "...",
  "routeId": "...",
  "latitude": 28.7,
  "longitude": 77.1,
  "speed": 12.5,
  "timestamp": "2024-05-10T10:30:00Z"
}
```

**Flight**:
```json
{
  "provider": "aviationstack",
  "flightIata": "BA123",
  "airlineIata": "BA",
  "departureIata": "LHR",
  "arrivalIata": "DEL",
  "departureScheduled": "2024-05-10T14:00:00Z",
  "arrivalScheduled": "2024-05-11T02:30:00Z",
  "delayMinutes": 0,
  "flightStatus": "scheduled"
}
```

**Train**:
```json
{
  "provider": "indian-rail-stub",
  "trainNumber": "12345",
  "currentStation": "Delhi Central",
  "delayMinutes": 0,
  "statusText": "On Schedule",
  "expectedArrival": "2024-05-10T20:00:00Z"
}
```

## Error Responses

```json
{
  "error": "Error Type",
  "message": "Details about what went wrong"
}
```

| Status | Error | Common Cause |
|--------|-------|--------------|
| 400 | Bad Request | Invalid query params |
| 401 | Unauthorized | Wrong/missing API key |
| 403 | Forbidden | Subscription tier too low |
| 429 | Rate Limited | Too many requests |
| 501 | Not Configured | API key not set |
| 504 | Timeout | Feed/API unavailable |

## Debugging Tips

### 1. Include Raw Provider Data
```bash
curl "...?feedUrl=...&includeRaw=true"
```

Response will include `raw` field with provider-specific payload.

### 2. Check Provider Status
```bash
curl http://localhost:3000/api/transport/providers/capabilities
```

Shows which providers are implemented/stubbed and what's needed.

### 3. Test Feed Directly
```bash
# For GTFS-Realtime
curl -H "Accept: application/json" https://feeds.example.com/gtfs-rt

# For Aviationstack
curl "https://api.aviationstack.com/v1/flights?access_key=YOUR_KEY&flight_iata=BA123"
```

### 4. Check Environment Variables
```bash
# In server directory
cat .env | grep -i transport
```

## Common Issues

| Issue | Solution |
|-------|----------|
| 501 Not Configured (Flight) | Set AVIATIONSTACK_API_KEY in .env |
| 400 Bad Request | Check required query params (feedUrl for bus, flightIata for flight) |
| 401 Unauthorized | API key is wrong or expired |
| 403 Forbidden | Subscription tier doesn't include endpoint |
| Timeout | Feed/API is slow or down, increase timeout |
| Empty array | Feed/API has no matching data |

## Adding a New Provider

Pattern to follow:

1. Create `src/providers/[mode]/` directory
2. Create `[name]Provider.ts` class
3. Create `[name].types.ts` for provider types
4. Create `[name].mapper.ts` for normalization
5. Update `src/schemas/normalizedTransport.schemas.ts` with new schema
6. Add controller method in `transportController.ts`
7. Add route in `transportRoutes.ts`
8. Update documentation

## Documentation Map

- **Getting Started**: `transport-providers.md` (5000+ words)
- **Capabilities**: `provider-matrix.md` (features, limitations, pricing)
- **Examples**: `api-integration-guide.md` (code samples, integration steps)
- **Architecture**: `providers/README.md` (module structure, patterns)
- **TODOs**: `INTEGRATION_CHECKLIST.md` (implementation tasks)
- **This File**: `quick-reference.md` (quick lookup)

## Key Decisions

✅ **Normalized schemas** - All providers map to common format
✅ **Pure mappers** - Easy to test and debug
✅ **Zod validation** - Type-safe at runtime
✅ **Provider isolation** - Swap providers without changing app logic
✅ **Optional raw payload** - Debug provider mismatches
✅ **Stub train provider** - Forces research on real provider selection

## What's Implemented

| Component | Status | Provider |
|-----------|--------|----------|
| Bus (GTFS-RT) | ✅ Implemented | All vehicle/trip/alert entities |
| Flight (Aviationstack) | ✅ Implemented | Status, schedules (if tier allows) |
| Train | 🟡 Stubbed | No real integration (mock only) |
| Error Handling | ✅ Implemented | All endpoints |
| Validation | ✅ Implemented | All query params (Zod) |
| Docs | ✅ Implemented | 5000+ words + guides |

## What's NOT Implemented

- ❌ Protobuf parsing for binary GTFS-RT feeds
- ❌ Real train provider implementation
- ❌ Caching (optional for MVP)
- ❌ WebSocket streaming
- ❌ Rate limiting on our end
- ❌ Database persistence

(See INTEGRATION_CHECKLIST.md for details)

## Next Steps

1. ✅ Setup environment (AVIATIONSTACK_API_KEY)
2. ✅ Test endpoints with real data
3. 🟡 Implement train provider
4. 🟡 Add protobuf parsing
5. 🟡 Add caching
6. 🟡 Frontend integration
7. 🟡 Production deployment

## Support

**Q: How do I add a new transport mode?**
A: Follow the pattern in existing providers. See `providers/README.md`.

**Q: Can I cache responses?**
A: Yes, implement caching in controller or add middleware. Start with in-memory TTL.

**Q: What if provider API is down?**
A: Will return 504 Timeout. Add retry logic and fallback providers.

**Q: Can I use multiple GTFS feeds?**
A: Yes, pass different feedUrl per request. Add caching by URL.

**Q: How do I test without API keys?**
A: All endpoints return stub data when provider is disabled. Train returns mocks always.

## Cheat Sheet

```bash
# Start dev server
npm run dev

# Check all providers
curl http://localhost:3000/api/transport/providers/capabilities

# Check logs for errors
# Look at terminal output while running npm run dev

# Test with real Aviationstack
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123"

# Include raw provider data for debugging
curl "http://localhost:3000/api/transport/flights/status?flightIata=BA123&includeRaw=true"

# Test GTFS-Realtime (needs feed URL)
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=https://feeds.example.com/gtfs-rt&includeRaw=true"

# All parameters are case-sensitive and URL-encoded
```

---

**For detailed information, see:**
- Main docs: `server/src/docs/transport-providers.md`
- Integration guide: `server/src/docs/api-integration-guide.md`
- Checklist: `server/src/docs/INTEGRATION_CHECKLIST.md`
