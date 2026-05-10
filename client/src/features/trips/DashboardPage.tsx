import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, CreditCard, MapPinned, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { money, formatDate } from "../../lib/format";
import { useTripStore } from "../../store/tripStore";

const destinations = [
  { city: "Kyoto", copy: "Temple mornings and tea lanes", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" },
  { city: "Lisbon", copy: "Coastal hills, tiles, pastries", image: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b" },
  { city: "Bali", copy: "Wellness, surf, rice fields", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4" }
];

export function DashboardPage() {
  const trips = useTripStore((state) => state.trips);
  const budgetTotal = trips.reduce((sum, trip) => sum + (trip.budget?.totalCost ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft md:p-10">
        <img className="absolute inset-0 h-full w-full object-cover opacity-45" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">Personalized multi-city planning</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">Build the trip, budget it, pack for it, share it.</h2>
          <p className="mt-4 text-white/80">Traveloop keeps stops, activities, expenses, notes, and public itineraries connected in one responsive workspace.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/create"><Button><Plus className="h-4 w-4" /> New trip</Button></Link>
            <Link to="/itinerary"><Button variant="secondary">Build itinerary <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card><MapPinned className="mb-3 text-teal-600" /><p className="text-2xl font-black">{trips.length}</p><p className="text-sm text-slate-500">Trips tracked</p></Card>
        <Card><CreditCard className="mb-3 text-coral" /><p className="text-2xl font-black">{money(budgetTotal)}</p><p className="text-sm text-slate-500">Budget planned</p></Card>
        <Card><CalendarDays className="mb-3 text-saffron" /><p className="text-2xl font-black">{trips.flatMap((trip) => trip.stops).length}</p><p className="text-sm text-slate-500">City stops mapped</p></Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-black">Recommended destinations</h3>
          <Link to="/search" className="text-sm font-semibold text-teal-700 dark:text-teal-300">Explore</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {destinations.map((item, index) => (
            <motion.div key={item.city} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className="overflow-hidden p-0">
                <img className="h-40 w-full object-cover" src={item.image} alt={item.city} />
                <div className="p-5"><h4 className="font-black">{item.city}</h4><p className="text-sm text-slate-500">{item.copy}</p></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-black">Previous trips</h3>
        {trips.length === 0 ? <EmptyState title="No trips yet" body="Create your first trip to unlock itinerary, budget, notes, checklist, and sharing workflows." /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {trips.slice(0, 4).map((trip) => (
              <Card key={trip.id} className="flex gap-4">
                <img className="h-24 w-28 rounded-2xl object-cover" src={trip.coverImage ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"} alt="" />
                <div>
                  <h4 className="font-black">{trip.title}</h4>
                  <p className="text-sm text-slate-500">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{trip.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
