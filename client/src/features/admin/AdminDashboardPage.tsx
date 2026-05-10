import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../../components/ui/Card";
import { tripApi } from "../../services/tripApi";

type Analytics = {
  totals: { users: number; tripsCreated: number; publicTrips: number; avgBudget: number };
  popularCities: { name: string; trips: number }[];
  engagement: { month: string; trips: number; notes: number }[];
};

export function AdminDashboardPage() {
  const [data, setData] = useState<Analytics>();
  useEffect(() => { void tripApi.analytics().then((result) => setData(result as Analytics)); }, []);
  if (!data) return <Card>Loading analytics...</Card>;
  return (
    <div className="space-y-6">
      <div><p className="label">Admin analytics</p><h2 className="text-3xl font-black">Traveloop metrics</h2></div>
      <div className="grid gap-4 md:grid-cols-4">{Object.entries(data.totals).map(([key, value]) => <Card key={key}><p className="label">{key}</p><p className="text-3xl font-black">{value.toLocaleString()}</p></Card>)}</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><h3 className="mb-4 text-xl font-black">Popular cities</h3><div className="h-72"><ResponsiveContainer><BarChart data={data.popularCities}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="trips" fill="#f97361" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-4 text-xl font-black">Engagement metrics</h3><div className="h-72"><ResponsiveContainer><LineChart data={data.engagement}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="trips" stroke="#0f766e" strokeWidth={3} /><Line type="monotone" dataKey="notes" stroke="#f59e0b" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card>
      </div>
    </div>
  );
}
