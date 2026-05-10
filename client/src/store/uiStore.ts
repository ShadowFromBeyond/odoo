import { create } from "zustand";

type UiState = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  darkMode: localStorage.getItem("traveloop_theme") === "dark",
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem("traveloop_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    set({ darkMode: next });
  }
}));
