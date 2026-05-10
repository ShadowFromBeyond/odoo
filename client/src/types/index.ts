export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  stopId: string;
  title: string;
  description?: string;
  category: string;
  estimatedCost: number;
  startTime?: string;
  duration: number;
};

export type TripStop = {
  id: string;
  tripId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  activities: Activity[];
};

export type Budget = {
  id: string;
  tripId: string;
  transportCost: number;
  hotelCost: number;
  activityCost: number;
  mealCost: number;
  miscellaneousCost: number;
  totalCost: number;
};

export type ChecklistItem = {
  id: string;
  tripId: string;
  title: string;
  category: string;
  packed: boolean;
};

export type TripNote = {
  id: string;
  tripId: string;
  content: string;
  day?: string;
  createdAt: string;
};

export type SharedTrip = {
  id: string;
  tripId: string;
  publicSlug: string;
};

export type Trip = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  visibility: "private" | "public";
  createdAt: string;
  stops: TripStop[];
  budget?: Budget;
  checklist: ChecklistItem[];
  notes: TripNote[];
  sharedTrip?: SharedTrip;
};

export type CityResult = {
  cityName: string;
  country: string;
  image: string;
  tags: string[];
  dailyBudget: number;
};

export type ActivityResult = {
  title: string;
  category: string;
  cityName: string;
  estimatedCost: number;
  duration: number;
  description: string;
};
