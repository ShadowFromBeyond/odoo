import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDate, tripStatus } from "../../lib/format";
import { useTripStore } from "../../store/tripStore";
import type { Trip } from "../../types";

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Card className="flex flex-col gap-4 md:flex-row">
      <img className="h-40 w-full rounded-3xl object-cover md:w-48" src={trip.coverImage ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"} alt="" />
      <div className="flex flex-1 flex-col justify-between">
        <div><h4 className="text-lg font-black">{trip.title}</h4><p className="text-sm text-slate-500">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{trip.description}</p></div>
        <div className="mt-4 flex flex-wrap gap-2"><Link to="/itinerary"><Button>Open</Button></Link><Link to="/expenses"><Button variant="secondary">Budget</Button></Link></div>
      </div>
    </Card>
  );
}

export function TripListingPage() {
  const trips = useTripStore((state) => state.trips);
  const groups = ["Ongoing", "Upcoming", "Completed"].map((status) => ({ status, items: trips.filter((trip) => tripStatus(trip.startDate, trip.endDate) === status) }));

  return (
    <div className="space-y-8">
      {trips.length === 0 && <EmptyState title="No trips listed" body="Create a trip and it will appear in ongoing, upcoming, or completed sections automatically." />}
      {groups.map((group) => (
        <section key={group.status}>
          <h2 className="mb-3 text-2xl font-black">{group.status}</h2>
          <div className="grid gap-4">{group.items.length ? group.items.map((trip) => <TripCard key={trip.id} trip={trip} />) : <Card className="text-sm text-slate-500">No {group.status.toLowerCase()} trips.</Card>}</div>
        </section>
      ))}
    </div>
  );
}
