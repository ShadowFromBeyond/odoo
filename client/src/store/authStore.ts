import { create } from "zustand";
import { api } from "../services/api";
import type { User } from "../types";

type AuthState = {
  user?: User;
  token?: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: unknown) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  token: localStorage.getItem("traveloop_token") ?? undefined,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    const result = await api<{ user: User; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("traveloop_token", result.token);
    set({ user: result.user, token: result.token, loading: false });
  },
  register: async (data) => {
    set({ loading: true });
    const result = await api<{ user: User; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) });
    localStorage.setItem("traveloop_token", result.token);
    set({ user: result.user, token: result.token, loading: false });
  },
  hydrate: async () => {
    const token = localStorage.getItem("traveloop_token");
    if (!token) return;
    try {
      const result = await api<{ user: User }>("/auth/me");
      set({ user: result.user, token });
    } catch {
      localStorage.removeItem("traveloop_token");
      set({ user: undefined, token: undefined });
    }
  },
  logout: () => {
    localStorage.removeItem("traveloop_token");
    set({ user: undefined, token: undefined });
  }
}));
