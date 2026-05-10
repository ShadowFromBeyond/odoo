import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { tripApi } from "../../services/tripApi";
import type { ActivityResult, CityResult } from "../../types";

const filters = ["culture", "food", "nature", "wellness", "adventure"];

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [cities, setCities] = useState<CityResult[]>([]);
  const [activities, setActivities] = useState<ActivityResult[]>([]);

  useEffect(() => {
    void Promise.all([tripApi.cities(query, filter), tripApi.activities(query)]).then(([cityResults, activityResults]) => {
      setCities(cityResults);
      setActivities(activityResults);
    });
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3"><Search className="text-teal-600" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cities or activities" /></div>
        <div className="mt-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(filter === item ? "" : item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/80 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}>{item}</button>)}</div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <section><h2 className="mb-3 text-2xl font-black">City results</h2><div className="grid gap-4">{cities.map((city) => <Card key={city.cityName} className="flex gap-4"><img className="h-28 w-32 rounded-3xl object-cover" src={city.image} alt="" /><div className="flex-1"><h3 className="font-black">{city.cityName}, {city.country}</h3><p className="text-sm text-slate-500">${city.dailyBudget}/day</p><div className="mt-2 flex flex-wrap gap-1">{city.tags.map((tag) => <span key={tag} className="rounded-full bg-teal-100 px-2 py-1 text-xs text-teal-700">{tag}</span>)}</div></div><Button variant="secondary" onClick={() => toast.success(`${city.cityName} added to trip ideas`)}>Add</Button></Card>)}</div></section>
        <section><h2 className="mb-3 text-2xl font-black">Activity results</h2><div className="grid gap-4">{activities.map((activity) => <Card key={activity.title}><div className="flex items-start justify-between gap-3"><div><p className="label">{activity.cityName} · {activity.category}</p><h3 className="font-black">{activity.title}</h3><p className="mt-1 text-sm text-slate-500">{activity.description}</p></div><Button variant="secondary" onClick={() => toast.success("Activity ready to add from itinerary builder")}>Add</Button></div></Card>)}</div></section>
      </div>
    </div>
  );
}
