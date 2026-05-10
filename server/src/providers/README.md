# Transport Providers Module - Integration Guide for Developers

This directory contains the backend service layer for real-time transport data. The module is designed to be provider-agnostic, allowing easy addition of new transport data sources without coupling to application business logic.

## Quick Reference

### Module Structure

```
src/
├── providers/                          # Provider implementations
│   ├── bus/
│   │   ├── gtfsRealtimeBusProvider.ts # GTFS-Realtime adapter
│   │   ├── gtfsRealtime.types.ts      # Type definitions
│   │   └── gtfsRealtime.mapper.ts     # Normalization logic
│   ├── flights/
│   │   ├── aviationstackFlightProvider.ts
│   │   ├── aviationstack.types.ts
│   │   └── aviationstack.mapper.ts
│   └── trains/
│       ├── trainProvider.interface.ts # Interface + stub
│       └── (no mapper - stub only)
├── schemas/
│   └── normalizedTransport.schemas.ts # Normalized response schemas (Zod)
├── controllers/
│   └── transportController.ts         # HTTP request handlers
├── routes/
│   └── transportRoutes.ts             # Express route definitions
└── docs/
    ├── transport-providers.md         # Main documentation
    ├── provider-matrix.md             # Capability comparison
    └── api-integration-guide.md       # Developer examples
```

## Getting Started

### 1. Test the Endpoints

Start the server: `npm run dev` in `server/`

List provider capabilities:
```bash
curl http://localhost:3000/api/transport/providers/capabilities
```

### 2. Configure Environment

Edit `server/.env`:

```bash
# For Aviationstack flights
AVIATIONSTACK_API_KEY=your_api_key

# Optional: GTFS-Realtime bus
GTFS_REALTIME_FEED_URL=https://feeds.example.com/gtfs-rt
```

### 3. Call Endpoints

See [API Integration Guide](./docs/api-integration-guide.md) for examples.

## Architecture

### Provider Pattern

Each provider follows this pattern:

1. **Provider Class** (e.g., `GtfsRealtimeBusProvider`)
   - Encapsulates external API logic
   - Fetches raw data from provider
   - No business logic

2. **Mapper Functions** (e.g., `gtfsRealtime.mapper.ts`)
   - Pure functions for testability
   - Convert provider-specific fields to normalized schema
   - Handle null/optional fields

3. **Normalized Schema** (in `schemas/normalizedTransport.schemas.ts`)
   - Zod schemas for validation
   - TypeScript types exported for consumers
   - Consistent across all providers

4. **Controller** (`transportController.ts`)
   - HTTP request handlers
   - Query parameter validation
   - Error handling and normalization
   - No provider logic (delegates to provider classes)

5. **Routes** (`transportRoutes.ts`)
   - Express route definitions
   - Maps HTTP paths to controller methods

### Data Flow

```
HTTP Request
    ↓
Route Handler
    ↓
Controller (validates query params)
    ↓
Provider Class (fetches raw data)
    ↓
Mapper Function (normalizes to schema)
    ↓
Response (Zod-validated)
    ↓
HTTP Response (JSON)
```

### Adding a New Provider

To add a new transport provider (e.g., rideshare, taxi):

1. **Create Provider Directory**
   ```bash
   mkdir src/providers/rideshare
   ```

2. **Define Types**
   ```typescript
   // src/providers/rideshare/rideshare.types.ts
   export interface RideshareVehicle {
     id: string;
     latitude: number;
     longitude: number;
     // ... provider-specific fields
   }
   ```

3. **Create Normalized Schema**
   ```typescript
   // Add to src/schemas/normalizedTransport.schemas.ts
   export const normalizedRideshareSchema = z.object({
     provider: z.string(),
     vehicleId: z.string(),
     latitude: z.number(),
     longitude: z.number(),
     // ... normalized fields
   });
   ```

4. **Create Provider Class**
   ```typescript
   // src/providers/rideshare/rideshareProvider.ts
   export class RideshareProvider {
     async fetchAvailableVehicles(): Promise<NormalizedRideshare[]> {
       // Implementation
     }
   }
   ```

5. **Create Mapper**
   ```typescript
   // src/providers/rideshare/rideshare.mapper.ts
   export function mapVehicleToNormalized(
     vehicle: RideshareVehicle,
     provider: string
   ): NormalizedRideshare {
     // Map fields
   }
   ```

6. **Add Controller Methods**
   ```typescript
   // In src/controllers/transportController.ts
   export async function getRideshareVehicles(req: Request, res: Response) {
     // Validation, provider call, response
   }
   ```

7. **Add Routes**
   ```typescript
   // In src/routes/transportRoutes.ts
   transportRoutes.get("/rideshare/vehicles", controller.getRideshareVehicles);
   ```

8. **Document**
   - Update `transport-providers.md`
   - Update `provider-matrix.md`
   - Update `api-integration-guide.md`

## Testing

### Unit Tests (Mapper Functions)

Mapper functions are pure and testable:

```typescript
import { mapVehiclePositionToNormalized } from "../providers/bus/gtfsRealtime.mapper";

test("maps GTFS entity to normalized schema", () => {
  const entity = { /* mock entity */ };
  const result = mapVehiclePositionToNormalized(entity, "gtfs-realtime");
  expect(result.vehicleId).toBe("...");
  expect(result.latitude).toBeDefined();
});
```

### Integration Tests (API Endpoints)

Test the full flow:

```typescript
import request from "supertest";

test("GET /api/transport/buses/vehicles returns normalized data", async () => {
  const res = await request(app)
    .get("/api/transport/buses/vehicles")
    .query({ feedUrl: "https://test-feed.example.com" });

  expect(res.status).toBe(200);
  expect(res.body.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        provider: expect.any(String),
        entityId: expect.any(String),
      }),
    ])
  );
});
```

## Common Tasks

### Enable Raw Payloads for Debugging

Add `includeRaw=true` to any request:

```bash
curl "http://localhost:3000/api/transport/buses/vehicles?feedUrl=...&includeRaw=true"
```

Response will include a `raw` field with provider-specific payload.

### Add Caching

See [API Integration Guide - Performance Considerations](./docs/api-integration-guide.md#performance-considerations)

### Handle Rate Limiting

Each provider response includes rate limit headers. Implement backoff/retry logic if needed.

### Add Monitoring/Logging

Update controller error handlers to log provider issues for observability.

## Documentation References

- **Main Docs**: [transport-providers.md](./docs/transport-providers.md)
- **Capabilities Matrix**: [provider-matrix.md](./docs/provider-matrix.md)
- **Integration Examples**: [api-integration-guide.md](./docs/api-integration-guide.md)

## Environment Variables

Required:
- `AVIATIONSTACK_API_KEY` (for flight provider)

Optional:
- `GTFS_REALTIME_FEED_URL` (bus provider)
- `GTFS_REALTIME_AUTH_HEADER` (bus provider auth)

See `server/.env.example` for template.

## Troubleshooting

### Import Errors

If you see ES module errors, check that:
- All imports use `.js` extension: `import { ... } from './file.js'`
- `package.json` has `"type": "module"`
- TypeScript config is set to ESM

### Provider Returns Empty Data

- Check feed URL is accessible
- Check authentication (if required)
- Check feed format (binary protobuf vs JSON)
- Try with `includeRaw=true` to see raw payload

### Type Errors in TypeScript

- Zod schemas are the source of truth for types
- Export types with `z.infer<typeof schema>`
- Run `npm run build` to catch type errors

## TODO Items for Integration Engineer

- [ ] Select real train provider (research options)
- [ ] Implement RealIndianRailProvider
- [ ] Add protobuf parsing for binary GTFS-Realtime feeds
- [ ] Set up API keys for production (Aviationstack)
- [ ] Implement caching strategy
- [ ] Add comprehensive unit/integration tests
- [ ] Set up monitoring and alerting for provider API failures
- [ ] Document any provider-specific quirks or limitations
- [ ] Performance testing and optimization
- [ ] Rate limit handling and backoff strategies

## Key Files

| File | Purpose |
|------|---------|
| `src/providers/*/Provider.ts` | Provider implementation |
| `src/providers/*/*.mapper.ts` | Normalization logic (testable) |
| `src/providers/*/*.types.ts` | Provider-specific types |
| `src/schemas/normalizedTransport.schemas.ts` | Normalized schemas (source of truth) |
| `src/controllers/transportController.ts` | HTTP handlers |
| `src/routes/transportRoutes.ts` | Express routes |
| `src/docs/transport-providers.md` | Main documentation |
| `.env.example` | Environment variables template |

## Resources

- [GTFS-Realtime Documentation](https://gtfs.org/documentation/realtime/reference/)
- [Aviationstack API Docs](https://aviationstack.com/documentation)
- [Zod Validation Library](https://zod.dev/)
- [Express Routing](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For questions or issues:
1. Check the documentation in `src/docs/`
2. Review existing provider implementations
3. Check error messages with `includeRaw=true`
4. See integration guide examples

