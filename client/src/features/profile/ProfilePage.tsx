import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input, Textarea } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import { useTripStore } from "../../store/tripStore";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const trips = useTripStore((state) => state.trips);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="text-center">
        <img className="mx-auto h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-soft" src={user?.avatar} alt="" />
        <h2 className="mt-4 text-2xl font-black">{user?.name}</h2>
        <p className="text-sm text-slate-500">{user?.city}, {user?.country}</p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{user?.bio}</p>
      </Card>
      <Card>
        <h3 className="mb-4 text-xl font-black">Editable user details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Name</label><Input defaultValue={user?.name} /></div>
          <div><label className="label">Email</label><Input defaultValue={user?.email} /></div>
          <div><label className="label">City</label><Input defaultValue={user?.city} /></div>
          <div><label className="label">Country</label><Input defaultValue={user?.country} /></div>
          <div className="md:col-span-2"><label className="label">Preferred trips</label><Textarea defaultValue="Culture walks, food markets, train-first routing, boutique stays" /></div>
          <Button onClick={() => toast.success("Profile changes staged for demo")}><Save className="h-4 w-4" /> Save profile</Button>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="mb-4 text-xl font-black">Previous trips</h3>
        <div className="grid gap-3 md:grid-cols-3">{trips.map((trip) => <div key={trip.id} className="rounded-3xl bg-white/70 p-4 dark:bg-slate-900"><p className="font-bold">{trip.title}</p><p className="text-sm text-slate-500">{trip.stops.length} stops</p></div>)}</div>
      </Card>
    </div>
  );
}
