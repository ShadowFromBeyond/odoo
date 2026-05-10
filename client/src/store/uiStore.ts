import { create } from "zustand";

type UiState = {
  _blank?: boolean;
};

export const useUiStore = create<UiState>(() => ({}));
