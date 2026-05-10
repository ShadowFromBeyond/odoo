import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CheckSquare, Compass, Eye, Home, LogOut, Moon, NotebookTabs, Plane, Plus, Search, Settings, StickyNote, Sun, User } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { Button } from "./ui/Button";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/itinerary", label: "Itinerary", icon: Plane },
  { to: "/view", label: "View", icon: Eye },
  { to: "/trips", label: "Trips", icon: Compass },
  { to: "/search", label: "Explore", icon: Search },
  { to: "/community", label: "Community", icon: NotebookTabs },
  { to: "/checklist", label: "Packing", icon: CheckSquare },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/expenses", label: "Expenses", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: Settings },
  { to: "/profile", label: "Profile", icon: User }
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/50 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-orange-400 text-white shadow-soft">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-black">Traveloop</p>
            <p className="text-xs text-slate-500">Multi-city planner</p>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"}`}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/72 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">Plan smarter</p>
              <h1 className="truncate text-xl font-black sm:text-2xl">Welcome back, {user?.name?.split(" ")[0] ?? "traveler"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={toggleDarkMode} aria-label="Toggle theme" className="h-11 w-11 p-0">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" onClick={() => { logout(); navigate("/login"); }} aria-label="Logout" className="h-11 w-11 p-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-3xl border border-white/70 bg-white/85 p-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 lg:hidden">
          {links.slice(0, 5).map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `grid place-items-center rounded-2xl py-2 ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500"}`}>
              <link.icon className="h-5 w-5" />
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
