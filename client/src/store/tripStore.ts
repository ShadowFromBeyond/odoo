import { create } from "zustand";
import { tripApi } from "../services/tripApi";
import type { Trip } from "../types";

type TripState = {
  trips: Trip[];
  selectedTripId?: string;
  loading: boolean;
  fetchTrips: () => Promise<void>;
  selectTrip: (id: string) => void;
  createTrip: (data: unknown) => Promise<Trip>;
  refreshTrip: () => Promise<void>;
};

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  loading: false,
  fetchTrips: async () => {
    set({ loading: true });
    const trips = await tripApi.list();
    set({ trips, selectedTripId: get().selectedTripId ?? trips[0]?.id, loading: false });
  },
  selectTrip: (id) => set({ selectedTripId: id }),
  createTrip: async (data) => {
    const trip = await tripApi.create(data);
    set((state) => ({ trips: [trip, ...state.trips], selectedTripId: trip.id }));
    return trip;
  },
  refreshTrip: async () => {
    const trips = await tripApi.list();
    set({ trips });
  }
}));
