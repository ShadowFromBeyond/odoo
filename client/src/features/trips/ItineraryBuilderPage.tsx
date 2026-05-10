import { zodResolver } from "@hookform/resolvers/zod";
import { Reorder, motion } from "framer-motion";
import { GripVertical, MapPin, Plus, StickyNote, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input, Textarea } from "../../components/ui/Input";
import { formatDate, money } from "../../lib/format";
import { tripApi } from "../../services/tripApi";
import { useTripStore } from "../../store/tripStore";
import type { TripStop } from "../../types";
import { TripSelector } from "./TripSelector";

const stopSchema = z.object({ cityName: z.string().min(1), country: z.string().min(1), arrivalDate: z.string().min(1), departureDate: z.string().min(1) });
const activitySchema = z.object({ title: z.string().min(1), category: z.string().min(1), estimatedCost: z.coerce.number().min(0), duration: z.coerce.number().min(15), description: z.string().optional() });
type StopForm = z.infer<typeof stopSchema>;
type ActivityForm = z.infer<typeof activitySchema>;

export function ItineraryBuilderPage() {
  const { trips, selectedTripId, refreshTrip } = useTripStore();
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  const [orderedStops, setOrderedStops] = useState<TripStop[]>([]);
  const stopForm = useForm<StopForm>({ resolver: zodResolver(stopSchema) });
  const activityForm = useForm<ActivityForm>({ resolver: zodResolver(activitySchema) });
  const [activeStopId, setActiveStopId] = useState<string>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setOrderedStops(trip?.stops ?? []);
    setActiveStopId(trip?.stops[0]?.id ?? "");
  }, [trip?.id, trip?.stops.length]);

  const activeStop = useMemo(() => orderedStops.find((stop) => stop.id === activeStopId) ?? orderedStops[0], [orderedStops, activeStopId]);

  if (!trip) return <EmptyState title="Create a trip first" body="The itinerary builder activates once you create or load a trip." />;

  async function addStop(values: StopForm) {
    await tripApi.addStop(trip.id, { ...values, orderIndex: orderedStops.length });
    await refreshTrip();
    stopForm.reset();
    toast.success("City section added");
  }

  async function addActivity(values: ActivityForm) {
    const stopId = activeStop?.id;
    if (!stopId) return;
    await tripApi.addActivity(trip.id, { ...values, stopId });
    await refreshTrip();
    activityForm.reset();
    toast.success("Activity added");
  }

  async function saveOrder(next: TripStop[]) {
    setOrderedStops(next);
    await tripApi.reorderStops(trip.id, next.map((stop, index) => ({ id: stop.id, orderIndex: index })));
    await refreshTrip();
  }

  async function addNote() {
    if (!note.trim()) return;
    await tripApi.note(trip.id, { content: note, day: activeStop?.cityName });
    setNote("");
    await refreshTrip();
    toast.success("Note saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="label">Build itinerary</p><h2 className="text-3xl font-black">Interactive trip timeline</h2></div>
        <TripSelector />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="mb-4 text-lg font-black">Add trip sections dynamically</h3>
          <form onSubmit={stopForm.handleSubmit(addStop)} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="City" {...stopForm.register("cityName")} />
            <Input placeholder="Country" {...stopForm.register("country")} />
            <Input type="date" {...stopForm.register("arrivalDate")} />
            <Input type="date" {...stopForm.register("departureDate")} />
            <Button className="md:col-span-2"><Plus className="h-4 w-4" /> Add city</Button>
          </form>
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h3 className="mb-4 text-lg font-black">Add activities</h3>
            <form onSubmit={activityForm.handleSubmit(addActivity)} className="grid gap-3">
              <select className="field" value={activeStopId} onChange={(event) => setActiveStopId(event.target.value)}>
                {orderedStops.map((stop) => <option key={stop.id} value={stop.id}>{stop.cityName}</option>)}
              </select>
              <Input placeholder="Activity title" {...activityForm.register("title")} />
              <div className="grid gap-3 md:grid-cols-3"><Input placeholder="Category" {...activityForm.register("category")} /><Input type="number" placeholder="Cost" {...activityForm.register("estimatedCost")} /><Input type="number" placeholder="Minutes" {...activityForm.register("duration")} /></div>
              <Textarea placeholder="Description" {...activityForm.register("description")} />
              <Button>Add activity</Button>
            </form>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><StickyNote className="h-5 w-5" /> Add notes</h3>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Day-specific note..." />
            <Button className="mt-3" variant="secondary" onClick={addNote}>Save note</Button>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">Reorder sections</h3>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">Drag cards</span>
          </div>
          {orderedStops.length === 0 ? <EmptyState title="No stops yet" body="Add cities to build the timeline." /> : (
            <Reorder.Group axis="y" values={orderedStops} onReorder={saveOrder} className="space-y-4">
              {orderedStops.map((stop, index) => (
                <Reorder.Item key={stop.id} value={stop}>
                  <motion.div className="rounded-3xl border border-slate-200 bg-white/75 p-4 dark:border-slate-800 dark:bg-slate-900/75">
                    <div className="flex gap-3">
                      <GripVertical className="mt-1 h-5 w-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase text-teal-700">Stop {index + 1}</p>
                        <h4 className="text-xl font-black"><MapPin className="mr-2 inline h-5 w-5 text-coral" />{stop.cityName}, {stop.country}</h4>
                        <p className="text-sm text-slate-500">{formatDate(stop.arrivalDate)} - {formatDate(stop.departureDate)}</p>
                        <div className="mt-4 grid gap-2">
                          {stop.activities.map((activity) => <div key={activity.id} className="rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800"><b>{activity.title}</b><span className="ml-2 text-slate-500">{activity.category} · {money(activity.estimatedCost)}</span></div>)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-teal-600 to-orange-400 p-5 text-white"><WalletCards className="mb-2" /><p className="text-sm text-white/80">Current budget</p><p className="text-3xl font-black">{money(trip.budget?.totalCost)}</p></div>
        </Card>
      </div>
    </div>
  );
}
