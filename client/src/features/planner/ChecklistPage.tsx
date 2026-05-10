import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { tripApi } from "../../services/tripApi";
import { useTripStore } from "../../store/tripStore";
import { TripSelector } from "../trips/TripSelector";

export function ChecklistPage() {
  const { trips, selectedTripId, refreshTrip } = useTripStore();
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Essentials");
  const [isAdding, setIsAdding] = useState(false);
  if (!trip) return <EmptyState title="No packing planner" body="Create a trip to keep a persistent checklist." />;
  const groups = Array.from(new Set(trip.checklist.map((item) => item.category)));

  async function addItem() {
    if (!title.trim()) {
      toast.error("Please enter an item name.");
      return;
    }

    setIsAdding(true);
    try {
      await tripApi.checklist(trip.id, { title, category });
      setTitle("");
      await refreshTrip();
      toast.success("Checklist item added");
    } catch (error) {
      toast.error("Unable to add item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="label">Packing checklist</p><h2 className="text-3xl font-black">Categorized planner</h2></div><TripSelector /></div>
      <Card className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add item" /><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" /><Button type="button" onClick={addItem} disabled={isAdding}><Plus className="h-4 w-4" /> Add</Button></Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <Card key={group}><h3 className="mb-3 text-lg font-black">{group}</h3><div className="space-y-2">{trip.checklist.filter((item) => item.category === group).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 dark:bg-slate-900"><input type="checkbox" checked={item.packed} onChange={async () => { await tripApi.updateChecklist(trip.id, item.id, { packed: !item.packed }); await refreshTrip(); }} /><span className={`flex-1 text-sm ${item.packed ? "line-through opacity-50" : ""}`}>{item.title}</span><button onClick={async () => { await tripApi.deleteChecklist(trip.id, item.id); await refreshTrip(); }}><Trash2 className="h-4 w-4 text-coral" /></button></div>)}</div></Card>)}
      </div>
    </div>
  );
}
