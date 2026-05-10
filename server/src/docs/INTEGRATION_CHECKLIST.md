# Integration Engineer TODO Checklist

This document tracks the implementation status and remaining work for the transport provider system.

## Current Status

### ✅ Completed

- [x] Architecture and folder structure
- [x] Normalized transport schemas (Zod)
- [x] GTFS-Realtime bus provider adapter
  - [x] Vehicle position fetching
  - [x] Trip update fetching
  - [x] Service alert fetching
  - [x] Mapper functions to normalized schema
- [x] Aviationstack flight provider adapter
  - [x] Flight status endpoint
  - [x] Flight schedule endpoint
  - [x] Mapper functions to normalized schema
  - [x] Error handling
- [x] Train provider interface and stub
  - [x] Interface definition (`ITrainProvider`)
  - [x] Stub implementation (`StubIndianRailProvider`)
  - [x] Stub mapper functions
- [x] HTTP controllers and routes
  - [x] 9 endpoints (3 bus, 2 flight, 3 train, 1 capabilities)
  - [x] Request validation (Zod)
  - [x] Error handling
- [x] Comprehensive documentation
  - [x] Main provider documentation
  - [x] Provider capability matrix
  - [x] API integration guide
  - [x] Module README
- [x] Environment configuration (.env.example)
- [x] Backend integration (added routes to app.ts)

---

## 🟡 In Progress / TODO

### Bus Provider (GTFS-Realtime)

#### High Priority

- [ ] **Protobuf Parsing Implementation**
  - [ ] Install `protobufjs` and `transit-realtime` packages
  - [ ] Implement binary protobuf parsing in `gtfsRealtimeBusProvider.ts`
  - [ ] Handle JSON fallback gracefully
  - [ ] Document protobuf parsing in comments
  - Location: `src/providers/bus/gtfsRealtimeBusProvider.ts` (~line 140-180)
  
- [ ] **Find and Configure GTFS-Realtime Feed**
  - [ ] Research available feeds (https://transitfeeds.com/)
  - [ ] For Delhi: Check Delhi DTC/DIMTS authorization requirements
  - [ ] Document feed URL in `.env`
  - [ ] Test with real feed data
  - [ ] Document any auth requirements

#### Medium Priority

- [ ] **Add Retry Logic**
  - [ ] Implement exponential backoff for failed requests
  - [ ] Configure max retry attempts
  - [ ] Log retry attempts

- [ ] **Add Caching**
  - [ ] Implement in-memory or Redis cache
  - [ ] Set TTL to 30-60 seconds (typical GTFS-RT update frequency)
  - [ ] Cache by feed URL

- [ ] **Add Unit Tests**
  - [ ] Test mapper functions with sample GTFS-RT data
  - [ ] Test provider initialization
  - [ ] Test error handling

---

### Flight Provider (Aviationstack)

#### High Priority

- [ ] **Setup Aviationstack Account**
  - [ ] Create account at https://aviationstack.com/
  - [ ] Choose subscription tier (free or paid)
  - [ ] Generate API key
  - [ ] Document rate limits and quotas
  - [ ] Add API key to `.env`

- [ ] **Verify Endpoint Availability**
  - [ ] Check which endpoints are available in subscription tier
  - [ ] Document any tier limitations in comments
  - [ ] Handle 403 Forbidden gracefully

#### Medium Priority

- [ ] **Add Schedule Endpoint Support**
  - [ ] Verify `/schedules` endpoint is available
  - [ ] Test with real API key
  - [ ] Handle cases where endpoint is not available

- [ ] **Add Caching**
  - [ ] Cache flight data (flights don't change rapidly)
  - [ ] Set TTL to 20-30 seconds

- [ ] **Add Unit Tests**
  - [ ] Test mapper functions
  - [ ] Mock API responses
  - [ ] Test error handling

- [ ] **Add Integration Tests**
  - [ ] Test with real Aviationstack API (if tier permits)
  - [ ] Test rate limiting behavior

---

### Train Provider

#### ⚠️ Critical - Must Complete Before Production

- [ ] **Research Train Providers**
  - [ ] Evaluate IndianRailAPI (https://indianrailapi.com/)
  - [ ] Evaluate RailAPI and other alternatives
  - [ ] Document pros/cons of each
  - [ ] Verify license/ToS compliance

- [ ] **Select Provider**
  - [ ] Decision: Which train provider to use?
  - [ ] Confirm data accuracy and update frequency
  - [ ] Verify commercial use permissions
  - [ ] Document choice and rationale

- [ ] **Setup Provider Account**
  - [ ] Create account with chosen provider
  - [ ] Generate API key/credentials
  - [ ] Document base URL and rate limits
  - [ ] Add credentials to `.env`

- [ ] **Implement Real Provider**
  - [ ] Create `RealIndianRailProvider` class or equivalent
  - [ ] Implement `fetchLiveStatus()` with real API calls
  - [ ] Implement `fetchPnrStatus()` with real API calls
  - [ ] Implement `fetchSchedule()` with real API calls
  - [ ] Create mapper functions from provider response
  - [ ] Handle errors gracefully
  - [ ] Location: `src/providers/trains/`

- [ ] **Replace Stub in Factory**
  - [ ] Update `createTrainProvider()` function
  - [ ] Load API credentials from environment
  - [ ] Remove stub import

- [ ] **Test Train Integration**
  - [ ] Unit tests with mock API responses
  - [ ] Integration tests with real API (if permitted)
  - [ ] Test input validation (train number, PNR, date format)
  - [ ] Test error cases

- [ ] **Document Train Provider**
  - [ ] Update `transport-providers.md`
  - [ ] Update `provider-matrix.md`
  - [ ] Update `api-integration-guide.md`
  - [ ] Include example requests/responses
  - [ ] Document any provider-specific quirks

---

### Testing

#### High Priority

- [ ] **Add Integration Tests for All Endpoints**
  - [ ] Test GET /api/transport/buses/vehicles
  - [ ] Test GET /api/transport/buses/trips
  - [ ] Test GET /api/transport/buses/alerts
  - [ ] Test GET /api/transport/flights/status
  - [ ] Test GET /api/transport/flights/schedules
  - [ ] Test GET /api/transport/trains/live
  - [ ] Test GET /api/transport/trains/pnr
  - [ ] Test GET /api/transport/trains/schedule
  - [ ] Test GET /api/transport/providers/capabilities

- [ ] **Test Error Cases**
  - [ ] Invalid query parameters
  - [ ] Missing required parameters
  - [ ] Network/timeout errors
  - [ ] 401/403/429 responses
  - [ ] Malformed provider responses

#### Medium Priority

- [ ] **Add Test Data**
  - [ ] Sample GTFS-Realtime feed entities
  - [ ] Sample Aviationstack responses
  - [ ] Sample train API responses

- [ ] **Performance Tests**
  - [ ] Measure response times
  - [ ] Test with large datasets
  - [ ] Profile mapper functions

---

### Performance & Optimization

#### Medium Priority

- [ ] **Add Caching Strategy**
  - [ ] Implement Redis cache (optional) or in-memory
  - [ ] Set appropriate TTLs per provider
  - [ ] Cache invalidation strategy
  - [ ] Monitor cache hit rates

- [ ] **Add Request Timeouts**
  - [ ] Configure appropriate timeouts per provider
  - [ ] Document timeout values

- [ ] **Add Rate Limiting**
  - [ ] Handle provider rate limits gracefully
  - [ ] Implement backoff/retry logic
  - [ ] Queue requests if needed

- [ ] **Optimize Queries**
  - [ ] Filter unnecessary data before normalization
  - [ ] Lazy-load optional fields

---

### Monitoring & Observability

#### Low Priority (After MVP)

- [ ] **Add Logging**
  - [ ] Log provider API calls
  - [ ] Log errors and timeouts
  - [ ] Log cache hits/misses

- [ ] **Add Metrics**
  - [ ] Response times per provider
  - [ ] Error rates per provider
  - [ ] Data staleness

- [ ] **Add Alerting**
  - [ ] Alert on repeated failures
  - [ ] Alert on rate limit hits
  - [ ] Alert on timeouts

---

### Frontend Integration

#### Medium Priority (Depends on Frontend Work)

- [ ] **Create Frontend Service Layer**
  - [ ] Location: `client/src/services/transportApi.ts`
  - [ ] Wrapper functions for each endpoint
  - [ ] Error handling
  - [ ] Type imports from backend

- [ ] **Add Transport UI Components**
  - [ ] Bus tracker component
  - [ ] Flight search component
  - [ ] Train status component
  - Location: `client/src/components/transport/`

- [ ] **Integrate into Trip Planning**
  - [ ] Add transport suggestions to trip builder
  - [ ] Display real-time updates during trip
  - [ ] Show alerts and delays

---

### Deployment & Production

#### Before First Deployment

- [ ] **Environment Configuration**
  - [ ] Generate strong API keys (not test keys)
  - [ ] Configure production API endpoints
  - [ ] Set appropriate timeouts/rate limits
  - [ ] Configure CORS if needed

- [ ] **Secrets Management**
  - [ ] Never commit API keys to git
  - [ ] Use secure secrets manager (AWS, Vault, etc.)
  - [ ] Rotate keys regularly

- [ ] **Monitoring Setup**
  - [ ] Configure logging to aggregator
  - [ ] Setup alerting for failures
  - [ ] Monitor API quotas

- [ ] **Documentation**
  - [ ] Update deployment docs
  - [ ] Document environment variables for ops
  - [ ] Create runbook for common issues

---

## Timeline Recommendations

### Phase 1: MVP (Week 1-2)
- [x] Architecture & scaffolding (DONE)
- [ ] Bus provider setup (test with real feed)
- [ ] Flight provider setup (Aviationstack account + testing)
- [ ] Basic error handling & logging
- **Deliverable**: Endpoints working with real data

### Phase 2: Robustness (Week 2-3)
- [ ] Train provider implementation
- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] Error handling edge cases
- **Deliverable**: All providers stable and tested

### Phase 3: Optimization (Week 3-4)
- [ ] Caching implementation
- [ ] Performance optimization
- [ ] Monitoring & alerting setup
- **Deliverable**: Production-ready performance

### Phase 4: Frontend Integration (Week 4+)
- [ ] Frontend service layer
- [ ] UI components
- [ ] Trip planning integration
- **Deliverable**: Full end-to-end feature

---

## Approval Checkpoints

### MVP Checkpoint
Before integrating into production:
- [ ] All endpoints return normalized data
- [ ] Error handling is graceful
- [ ] Documentation is complete
- [ ] At least one provider uses real API
- [ ] Test coverage > 70%

### Production Checkpoint
Before first deployment:
- [ ] All THREE providers implemented
- [ ] Test coverage > 80%
- [ ] Performance benchmarked
- [ ] Security review passed
- [ ] Load testing completed
- [ ] Monitoring/alerting configured
- [ ] Disaster recovery plan in place

---

## Questions for Integration Engineer

### Before You Start

1. **Bus Provider**
   - Which GTFS-Realtime feed should we use?
   - Do we have authorization for Delhi DTC/DIMTS?
   - Should we support multiple feeds or start with one?

2. **Flight Provider**
   - Aviationstack subscription level decided?
   - Free tier sufficient for MVP?
   - Expected request volume?

3. **Train Provider**
   - Confirmed choice of provider?
   - Verified license/ToS compliance?
   - Timeline for implementation?

### During Implementation

1. Any provider-specific quirks or limitations discovered?
2. Do we need additional fields in normalized schemas?
3. Should we add caching from the start?
4. What's the expected update frequency?
5. Any specific error scenarios to handle?

### Before Production

1. Have all providers been tested with real data?
2. Are we prepared for provider downtime?
3. Do we have backup providers or graceful degradation?
4. Monitoring and alerting rules configured?
5. Rate limit strategy defined?

---

## Implementation Notes

### Protobuf Parsing (Bus)
**Status**: Not yet implemented

The current implementation expects JSON-formatted GTFS-Realtime feeds. Most official GTFS-Realtime feeds are served as binary protobuf. To support these:

1. Install: `npm install protobufjs transit-realtime`
2. Reference: https://github.com/MobilityData/gtfs-realtime.js
3. Update: `fetchFeedMessage()` method in `gtfsRealtimeBusProvider.ts`

**Estimated Effort**: 2-4 hours

### Train Provider Selection
**Status**: Research needed

Not all providers are equal. Evaluation criteria:
- Data accuracy and freshness
- API reliability and uptime
- Rate limits suitable for our traffic
- License/ToS permits our use case
- Support and documentation quality
- Cost (free vs paid)

**Recommended**: Start with IndianRailAPI (free tier available)

**Estimated Effort**: 8-16 hours (research + implementation)

### Caching Strategy
**Status**: Optional but recommended

For MVP, basic in-memory caching is sufficient:
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 30 * 1000; // 30 seconds

if (cache.has(key) && Date.now() - cache.get(key)!.timestamp < TTL) {
  return cache.get(key)!.data;
}
```

Future: Consider Redis for distributed caching.

**Estimated Effort**: 2-4 hours (in-memory), 8-12 hours (Redis)

---

## Support Resources

- **GTFS Docs**: https://gtfs.org/
- **GTFS-Realtime Ref**: https://gtfs.org/documentation/realtime/reference/
- **Aviationstack Docs**: https://aviationstack.com/documentation
- **Zod Validation**: https://zod.dev/
- **Express.js Routing**: https://expressjs.com/en/guide/routing.html
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## Legend

- ✅ Completed
- 🟡 In Progress / TODO
- ⚠️ Critical
- 🔧 Implementation Detail
- 📋 Documentation
- 🧪 Testing

