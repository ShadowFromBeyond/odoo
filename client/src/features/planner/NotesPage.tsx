import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input, Textarea } from "../../components/ui/Input";
import { tripApi } from "../../services/tripApi";
import { useTripStore } from "../../store/tripStore";
import { TripSelector } from "../trips/TripSelector";

export function NotesPage() {
  const { trips, selectedTripId, refreshTrip } = useTripStore();
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  const [day, setDay] = useState("Day 1");
  const [content, setContent] = useState("");
  if (!trip) return <EmptyState title="No notes yet" body="Create a trip to add, edit, and delete day-specific notes." />;

  async function addNote() {
    if (!content.trim()) return;
    await tripApi.note(trip.id, { day, content });
    setContent("");
    await refreshTrip();
    toast.success("Note added");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="label">Trip notes</p><h2 className="text-3xl font-black">Day-specific notes</h2></div><TripSelector /></div>
      <Card className="space-y-3"><Input value={day} onChange={(event) => setDay(event.target.value)} /><Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write travel note..." /><Button onClick={addNote}><Plus className="h-4 w-4" /> Add note</Button></Card>
      <div className="grid gap-4 md:grid-cols-2">
        {trip.notes.map((note) => <Card key={note.id}><p className="label">{note.day ?? "General"}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{note.content}</p><div className="mt-4 flex gap-2"><Button variant="secondary" onClick={async () => { await tripApi.updateNote(trip.id, note.id, { day: note.day, content: `${note.content} Updated.` }); await refreshTrip(); }}><Edit3 className="h-4 w-4" /> Edit</Button><Button variant="ghost" onClick={async () => { await tripApi.deleteNote(trip.id, note.id); await refreshTrip(); }}><Trash2 className="h-4 w-4" /> Delete</Button></div></Card>)}
      </div>
    </div>
  );
}
