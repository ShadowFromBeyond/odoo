import { api } from "./api";
import type { ActivityResult, CityResult, Trip } from "../types";

export const tripApi = {
  list: () => api<Trip[]>("/trips"),
  create: (data: unknown) => api<Trip>("/trips", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => api<Trip>(`/trips/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  addStop: (id: string, data: unknown) => api(`/trips/${id}/stops`, { method: "POST", body: JSON.stringify(data) }),
  reorderStops: (id: string, order: unknown) => api(`/trips/${id}/stops/reorder`, { method: "PUT", body: JSON.stringify({ order }) }),
  addActivity: (id: string, data: unknown) => api(`/trips/${id}/activities`, { method: "POST", body: JSON.stringify(data) }),
  budget: (id: string, data: unknown) => api(`/trips/${id}/budget`, { method: "PUT", body: JSON.stringify(data) }),
  checklist: (id: string, data: unknown) => api(`/trips/${id}/checklist`, { method: "POST", body: JSON.stringify(data) }),
  updateChecklist: (tripId: string, itemId: string, data: unknown) => api(`/trips/${tripId}/checklist/${itemId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteChecklist: (tripId: string, itemId: string) => api(`/trips/${tripId}/checklist/${itemId}`, { method: "DELETE" }),
  note: (id: string, data: unknown) => api(`/trips/${id}/notes`, { method: "POST", body: JSON.stringify(data) }),
  updateNote: (tripId: string, noteId: string, data: unknown) => api(`/trips/${tripId}/notes/${noteId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNote: (tripId: string, noteId: string) => api(`/trips/${tripId}/notes/${noteId}`, { method: "DELETE" }),
  share: (id: string) => api(`/trips/${id}/share`, { method: "POST" }),
  cities: (query = "", tag = "") => api<CityResult[]>(`/explore/cities?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}`),
  activities: (query = "", category = "") => api<ActivityResult[]>(`/explore/activities?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`),
  analytics: () => api<unknown>("/admin/analytics")
};
