import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { CommunityFeedPage } from "./features/community/CommunityFeedPage";
import { LeafletMapPage } from "./features/explore/LeafletMapPage";
import { SearchPage } from "./features/explore/SearchPage";
import { ChecklistPage } from "./features/planner/ChecklistPage";
import { ExpensePage } from "./features/planner/ExpensePage";
import { NotesPage } from "./features/planner/NotesPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { CreateTripPage } from "./features/trips/CreateTripPage";
import { DashboardPage } from "./features/trips/DashboardPage";
import { ItineraryBuilderPage } from "./features/trips/ItineraryBuilderPage";
import { ItineraryViewPage } from "./features/trips/ItineraryViewPage";
import { TripListingPage } from "./features/trips/TripListingPage";
import { useAuthStore } from "./store/authStore";
import { useTripStore } from "./store/tripStore";
export function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const token = useAuthStore((state) => state.token);
  const fetchTrips = useTripStore((state) => state.fetchTrips);
  useEffect(() => { void hydrate(); }, []);
  useEffect(() => { if (token) void fetchTrips(); }, [token, fetchTrips]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/create" element={<CreateTripPage />} />
          <Route path="/itinerary" element={<ItineraryBuilderPage />} />
          <Route path="/view" element={<ItineraryViewPage />} />
          <Route path="/trips" element={<TripListingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/map" element={<LeafletMapPage />} />
          <Route path="/community" element={<CommunityFeedPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
