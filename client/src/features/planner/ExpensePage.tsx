import { AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { money } from "../../lib/format";
import { tripApi } from "../../services/tripApi";
import { useTripStore } from "../../store/tripStore";
import { TripSelector } from "../trips/TripSelector";

const colors = ["#0f766e", "#f97361", "#f59e0b", "#38bdf8", "#64748b"];

export function ExpensePage() {
  const { trips, selectedTripId, refreshTrip } = useTripStore();
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  if (!trip) return <EmptyState title="No expenses yet" body="Create a trip to estimate budgets and track expense categories." />;
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const budget = trip.budget ?? { transportCost: 0, hotelCost: 0, activityCost: 0, mealCost: 0, miscellaneousCost: 0, totalCost: 0 };
  const rows = [
    { key: "transportCost", label: "Transport", value: budget.transportCost },
    { key: "hotelCost", label: "Hotel", value: budget.hotelCost },
    { key: "activityCost", label: "Activities", value: budget.activityCost },
    { key: "mealCost", label: "Meals", value: budget.mealCost },
    { key: "miscellaneousCost", label: "Misc", value: budget.miscellaneousCost }
  ];
  const dayTotals = trip.stops.map((stop) => ({ day: stop.cityName, total: stop.activities.reduce((sum, activity) => sum + activity.estimatedCost, 0) }));

  async function saveBudget(formData: FormData) {
    setIsSavingBudget(true);
    try {
      const next = Object.fromEntries(rows.map((row) => [row.key, Number(formData.get(row.key) ?? 0)]));
      await tripApi.budget(trip.id, next);
      await refreshTrip();
      toast.success("Budget saved successfully");
    } catch (error) {
      toast.error("Unable to save budget. Please try again.");
    } finally {
      setIsSavingBudget(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="label">Expense tracker</p><h2 className="text-3xl font-black">Tables, totals, alerts</h2></div><TripSelector /></div>
      {budget.totalCost > 2500 && <Card className="flex items-center gap-3 border-coral/40 bg-coral/10"><AlertTriangle className="text-coral" /><p className="font-semibold">Budget alert: this trip is above the demo threshold of $2,500.</p></Card>}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="mb-4 text-xl font-black">Expense table</h3>
          <form onSubmit={(event) => { event.preventDefault(); void saveBudget(new FormData(event.currentTarget)); }} className="space-y-3">{rows.map((row) => <div key={row.key} className="grid grid-cols-[1fr_160px] items-center gap-3"><span className="font-semibold">{row.label}</span><Input name={row.key} type="number" defaultValue={row.value} /></div>)}<Button type="submit" disabled={isSavingBudget}>{isSavingBudget ? "Saving..." : "Save budget"}</Button></form>
          <p className="mt-5 text-4xl font-black text-teal-700 dark:text-teal-300">{money(budget.totalCost)}</p>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          <Card><h3 className="mb-3 text-lg font-black">Pie visualization</h3><div className="h-60"><ResponsiveContainer><PieChart><Pie data={rows} dataKey="value" nameKey="label" innerRadius={48} outerRadius={80}>{rows.map((_, index) => <Cell key={index} fill={colors[index]} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} /></PieChart></ResponsiveContainer></div></Card>
          <Card><h3 className="mb-3 text-lg font-black">Daily activity totals</h3><div className="h-60"><ResponsiveContainer><BarChart data={dayTotals}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="total" fill="#0f766e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
        </div>
      </div>
    </div>
  );
}
