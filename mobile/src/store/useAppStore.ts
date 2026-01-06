/**
 * Global App State Management with Zustand
 * 
 * Minimal state management - only for UI state and cached API responses.
 * No business logic here.
 */

import { create } from "zustand";
import { Explanation, Transaction, WeatherState } from "@/types/api";

interface AppState {
  // Current momentum state
  currentExplanation: Explanation | null;
  isLoadingMomentum: boolean;

  // Recent transactions
  recentTransactions: Transaction[];
  isLoadingTransactions: boolean;

  // UI state
  currentWeather: WeatherState | null;

  // Actions
  setExplanation: (explanation: Explanation) => void;
  setLoadingMomentum: (loading: boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoadingTransactions: (loading: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentExplanation: null,
  isLoadingMomentum: false,
  recentTransactions: [],
  isLoadingTransactions: false,
  currentWeather: null,

  // Actions
  setExplanation: (explanation) =>
    set({
      currentExplanation: explanation,
      currentWeather: explanation.weather_state,
    }),

  setLoadingMomentum: (loading) => set({ isLoadingMomentum: loading }),

  setTransactions: (transactions) => set({ recentTransactions: transactions }),

  setLoadingTransactions: (loading) => set({ isLoadingTransactions: loading }),

  addTransaction: (transaction) =>
    set((state) => ({
      recentTransactions: [transaction, ...state.recentTransactions],
    })),
}));
