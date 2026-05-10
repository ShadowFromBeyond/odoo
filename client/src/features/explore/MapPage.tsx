import { useEffect, useRef, useState } from "react";
import GoogleMapReact from "google-map-react";
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

interface MarkerProps {
  lat: number;
  lng: number;
  name: string;
  country: string;
  color: string;
  tripTitle: string;
  id: string;
  onClick: (id: string) => void;
}

// Custom marker component for Google Maps
const Marker = ({ color, name, onClick, id }: MarkerProps) => (
  <div
    onClick={() => onClick(id)}
    className="cursor-pointer transform transition-transform hover:scale-110"
    style={{
      background: color,
      width: "32px",
      height: "32px",
      borderRadius: "50% 50% 50% 0",
      transform: "rotate(-45deg)",
      border: "3px solid white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    title={name}
  >
    <div
      style={{
        width: "10px",
        height: "10px",
        background: "white",
        borderRadius: "50%",
        transform: "rotate(45deg)",
      }}
    />
  </div>
);

function MapControls({ mapRef }: { mapRef: any }) {
  const handleZoomIn = () => {
    if (mapRef.current) {
      const map = mapRef.current.getMap?.();
      if (map) map.setZoom((map.getZoom() || 2) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const map = mapRef.current.getMap?.();
      if (map) map.setZoom((map.getZoom() || 2) - 1);
    }
  };

  const handleWorldView = () => {
    if (mapRef.current) {
      const map = mapRef.current.getMap?.();
      if (map) {
        map.setCenter({ lat: 20, lng: 0 });
        map.setZoom(2);
      }
    }
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 active:scale-95"
        title="Zoom In"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      <button
        onClick={handleZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 active:scale-95"
        title="Zoom Out"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
      <button
        onClick={handleWorldView}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 active:scale-95"
        title="World View"
      >
        <Locate className="h-5 w-5" />
      </button>
    </div>
  );
}

export function MapPage() {
  const trips = useTripStore((s) => s.trips);
  const [selected, setSelected] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Build markers from trip stops + demo destinations
  const tripMarkers = trips.flatMap((trip) =>
    (trip.stops ?? []).map((stop) => {
      // Try to match to a known city for coordinates
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
  ).filter(Boolean) as { id: string; name: string; country: string; lat: number; lng: number; color: string; tripTitle: string }[];

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

  const [tooltips, setTooltips] = useState<{ [key: string]: boolean }>({});

  const handleMarkerHover = (id: string, isHovering: boolean) => {
    setTooltips((prev) => ({ ...prev, [id]: isHovering }));
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
          <GoogleMapReact
            ref={mapRef}
            bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "" }}
            defaultCenter={{ lat: 20, lng: 0 }}
            defaultZoom={2}
            yesIWantToUseGoogleMapApiInternals
          >
            {markers.map((m) => (
              <div
                key={m.id}
                lat={m.lat}
                lng={m.lng}
                onMouseEnter={() => handleMarkerHover(m.id, true)}
                onMouseLeave={() => handleMarkerHover(m.id, false)}
              >
                <Marker
                  lat={m.lat}
                  lng={m.lng}
                  name={m.name}
                  country={m.country}
                  color={m.color}
                  tripTitle={m.tripTitle}
                  id={m.id}
                  onClick={() => setSelected(m.id)}
                />
                {tooltips[m.id] && (
                  <div
                    className="absolute -top-16 left-1/2 -translate-x-1/2 min-w-[160px] rounded-lg bg-white p-2 shadow-lg border border-slate-200 whitespace-nowrap"
                    style={{ zIndex: 1001 }}
                  >
                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.country}</p>
                    <p className="mt-1 text-xs font-medium text-blue-600">{m.tripTitle}</p>
                  </div>
                )}
              </div>
            ))}
          </GoogleMapReact>
          <MapControls mapRef={mapRef} />
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
