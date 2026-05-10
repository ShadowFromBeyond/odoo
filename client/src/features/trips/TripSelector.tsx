import { useTripStore } from "../../store/tripStore";

export function TripSelector() {
  const { trips, selectedTripId, selectTrip } = useTripStore();
  if (!trips.length) return null;
  return (
    <select className="field max-w-sm" value={selectedTripId} onChange={(event) => selectTrip(event.target.value)}>
      {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.title}</option>)}
    </select>
  );
}
