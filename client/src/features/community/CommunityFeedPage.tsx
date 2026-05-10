import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTripStore } from "../../store/tripStore";

export function CommunityFeedPage() {
  const trips = useTripStore((state) => state.trips);
  const publicTrips = trips.filter((trip) => trip.visibility === "public" || trip.sharedTrip);
  const feed = publicTrips.length ? publicTrips : trips;
  return (
    <div className="space-y-4">
      <div><p className="label">Community feed</p><h2 className="text-3xl font-black">Public itineraries</h2></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {feed.map((trip) => (
          <Card key={trip.id} className="overflow-hidden p-0">
            <img className="h-44 w-full object-cover" src={trip.coverImage ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"} alt="" />
            <div className="p-5"><p className="label">{trip.stops.length} stops · {trip.visibility}</p><h3 className="text-xl font-black">{trip.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{trip.description}</p><Button className="mt-4 w-full" variant="secondary" onClick={() => toast.success("Trip copied into your planning board")}><Copy className="h-4 w-4" /> Copy trip</Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
