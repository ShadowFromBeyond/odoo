import { zodResolver } from "@hookform/resolvers/zod";
import { Plane, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side: Branding / Image */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:block">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
          alt="Airplane"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide">CORPORATE TRAVEL</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight">Elevate your<br />business travel.</h2>
          <p className="max-w-md text-lg text-slate-300">
            Streamline your bookings, manage itineraries, and experience premium service with Traveloop Corporate.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Plane className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">Please enter your corporate credentials to sign in.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Business Email</label>
                <Input type="email" placeholder="name@company.com" className="h-12 bg-white" {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <Input type="password" placeholder="••••••••" className="h-12 bg-white" {...register("password")} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <Button className="h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have a corporate account?{" "}
              <Link className="font-semibold text-blue-600 hover:text-blue-500" to="/register">
                Contact Sales
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
