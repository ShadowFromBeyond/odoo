import { zodResolver } from "@hookform/resolvers/zod";
import { Plane } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@traveloop.app", password: "password123" }
  });

  async function onSubmit(values: LoginForm) {
    try {
      await login(values.email, values.password);
      toast.success("Welcome to Traveloop");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-teal-500 to-orange-400 text-white">
            <Plane />
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">Traveloop</h1>
          <p className="mt-2 text-sm text-slate-500">Log in to continue planning your next loop.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-coral">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <Input type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-coral">{errors.password.message}</p>}
          </div>
          <Button className="w-full" disabled={isSubmitting}>Login</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link className="font-semibold text-teal-700 dark:text-teal-300" to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
