import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input, Textarea } from "../../components/ui/Input";
import { useTripStore } from "../../store/tripStore";

const schema = z.object({
  title: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional()
});
type Form = z.infer<typeof schema>;

const suggestions = ["Kyoto", "Lisbon", "Marrakesh", "Barcelona"];

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useTripStore((state) => state.createTrip);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    await createTrip({ ...values, coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", visibility: "private" });
    toast.success("Trip created");
    navigate("/itinerary");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"><CalendarPlus /></div>
          <div><p className="label">Create new trip</p><h2 className="text-2xl font-black">Start with the frame</h2></div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="label">Trip name</label><Input {...register("title")} />{errors.title && <p className="text-xs text-coral">{errors.title.message}</p>}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label">Start date</label><Input type="date" {...register("startDate")} /></div>
            <div><label className="label">End date</label><Input type="date" {...register("endDate")} /></div>
          </div>
          <div><label className="label">Description</label><Textarea {...register("description")} /></div>
          <Button disabled={isSubmitting}>Create trip</Button>
        </form>
      </Card>
      <div>
        <h3 className="mb-3 text-xl font-black">Suggested places</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {suggestions.map((city) => (
            <Card key={city} className="flex items-center justify-between">
              <div><h4 className="font-black">{city}</h4><p className="text-sm text-slate-500">Great fit for a multi-city loop.</p></div>
              <Button variant="secondary" onClick={() => setValue("title", `${city} City Loop`)}>Use</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
