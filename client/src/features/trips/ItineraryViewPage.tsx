import { CalendarDays, List, WalletCards } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDate, money } from "../../lib/format";
import { useTripStore } from "../../store/tripStore";
import { TripSelector } from "./TripSelector";

const colors = ["#0f766e", "#f97361", "#f59e0b", "#38bdf8", "#64748b"];

export function ItineraryViewPage() {
  const [view, setView] = useState<"calendar" | "list">("list");
  const { trips, selectedTripId } = useTripStore();
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  if (!trip) return <EmptyState title="No itinerary yet" body="Create a trip and add stops to see the day-wise itinerary and budget." />;
  const budget = trip.budget;
  const budgetData = budget ? [
    { name: "Transport", value: budget.transportCost },
    { name: "Hotel", value: budget.hotelCost },
    { name: "Activities", value: budget.activityCost },
    { name: "Meals", value: budget.mealCost },
    { name: "Misc", value: budget.miscellaneousCost }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="label">Itinerary view + budget</p><h2 className="text-3xl font-black">{trip.title}</h2></div>
        <div className="flex gap-2"><TripSelector /><Button variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}><List className="h-4 w-4" /></Button><Button variant={view === "calendar" ? "primary" : "secondary"} onClick={() => setView("calendar")}><CalendarDays className="h-4 w-4" /></Button></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h3 className="mb-4 text-xl font-black">{view === "calendar" ? "Calendar blocks" : "Day-wise itinerary"}</h3>
          <div className={view === "calendar" ? "grid gap-3 md:grid-cols-2" : "space-y-4"}>
            {trip.stops.map((stop, index) => (
              <div key={stop.id} className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="label">Day {index + 1}</p>
                <h4 className="text-lg font-black">{stop.cityName}</h4>
                <p className="text-sm text-slate-500">{formatDate(stop.arrivalDate)} - {formatDate(stop.departureDate)}</p>
                <div className="mt-4 border-l-2 border-teal-500 pl-4">
                  {stop.activities.map((activity) => <div key={activity.id} className="mb-3"><p className="font-semibold">{activity.title}</p><p className="text-sm text-slate-500">{activity.duration} min · {money(activity.estimatedCost)}</p></div>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 flex items-center gap-2 text-xl font-black"><WalletCards className="h-5 w-5" /> Budget breakdown</h3>
          <p className="text-4xl font-black text-teal-700 dark:text-teal-300">{money(budget?.totalCost)}</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{budgetData.map((_, index) => <Cell key={index} fill={colors[index]} />)}</Pie>
                <Tooltip formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">{budgetData.map((item) => <div key={item.name} className="flex justify-between rounded-2xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800"><span>{item.name}</span><b>{money(item.value)}</b></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
