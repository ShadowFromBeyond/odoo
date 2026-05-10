import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input, Textarea } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  bio: z.string().optional()
});

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: RegisterForm) {
    try {
      await registerUser(values);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-3xl p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">Join Traveloop</p>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">Create your travel profile</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          {(["firstName", "lastName", "email", "password", "phone", "city", "country"] as const).map((name) => (
            <div key={name}>
              <label className="label">{name.replace(/([A-Z])/g, " $1")}</label>
              <Input type={name === "password" ? "password" : "text"} {...register(name)} />
              {errors[name] && <p className="mt-1 text-xs text-coral">{errors[name]?.message}</p>}
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="label">Additional info</label>
            <Textarea placeholder="Preferred trip style, diet notes, mobility needs, dream regions..." {...register("bio")} />
          </div>
          <Button className="md:col-span-2" disabled={isSubmitting}>Register</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-teal-700 dark:text-teal-300" to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
