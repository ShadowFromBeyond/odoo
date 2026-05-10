import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTripStore } from "../../store/tripStore";
import { MapPin, Navigation, ZoomIn, ZoomOut, Locate } from "lucide-react";

// Well-known cities with coordinates for demo purposes
const DEMO_DESTINATIONS: { name: string; country: string; lat: number; lng: number; color: string }[] = [
  { name: "New Delhi", country: "India", lat: 28.6139, lng: 77.209, color: "#ef4444" },
  { name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, color: "#f97316" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, color: "#8b5cf6" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, color: "#06b6d4" },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006, color: "#22c55e" },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, color: "#3b82f6" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, color: "#eab308" },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, color: "#ec4899" },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, color: "#14b8a6" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, color: "#a855f7" },
];

interface MarkerData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  color: string;
  tripTitle: string;
}

export function LeafletMapPage() {
  const trips = useTripStore((s) => s.trips);
  const [selected, setSelected] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Build markers from trip stops + demo destinations
  const tripMarkers = trips.flatMap((trip) =>
    (trip.stops ?? []).map((stop) => {
      const known = DEMO_DESTINATIONS.find(
        (d) => d.name.toLowerCase() === stop.cityName.toLowerCase()
      );
      if (!known) return null;
      return {
        id: stop.id,
        name: stop.cityName,
        country: stop.country,
        lat: known.lat,
        lng: known.lng,
        color: known.color,
        tripTitle: trip.title,
      };
    })
  ).filter(Boolean) as MarkerData[];

  // If no trip markers, show demo destinations
  const markers = tripMarkers.length > 0 ? tripMarkers : DEMO_DESTINATIONS.map((d, i) => ({
    id: `demo-${i}`,
    name: d.name,
    country: d.country,
    lat: d.lat,
    lng: d.lng,
    color: d.color,
    tripTitle: "Popular Destination",
  }));

  const createCustomIcon = (color: string) => {
    return new Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M16 0C9.4 0 4 5.4 4 12c0 8 12 20 12 20s12-12 12-20c0-6.6-5.4-12-12-12z" fill="${color}"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <Navigation className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Explore Map</h2>
          <p className="text-sm text-slate-500">
            {tripMarkers.length > 0
              ? `Showing ${tripMarkers.length} stops from your trips`
              : "Discover popular destinations around the world"}
          </p>
        </div>
      </div>

      {/* Map Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="relative h-[520px] w-full">
          <MapContainer 
            ref={mapRef}
            center={[20, 0]} 
            zoom={2} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng] as LatLngExpression}
                icon={createCustomIcon(m.color)}
                eventHandlers={{
                  click: () => setSelected(m.id),
                }}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.country}</p>
                    <p className="mt-1 text-xs font-medium text-blue-600">{m.tripTitle}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Destination Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {markers.map((m) => (
          <div
            key={m.id}
            className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md ${
              selected === m.id ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white"
            }`}
            onClick={() => setSelected(m.id)}
          >
            <div
              className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: m.color + "20" }}
            >
              <MapPin className="h-5 w-5" style={{ color: m.color }} />
            </div>
            <p className="text-sm font-semibold text-slate-800">{m.name}</p>
            <p className="text-xs text-slate-400">{m.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
