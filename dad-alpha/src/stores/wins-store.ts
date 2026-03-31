"use client";

import { create } from "zustand";
import type { WeeklyWinSummary } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_WIN: WeeklyWinSummary = {
  household_id: "mock_household",
  week_start: "2026-03-24",
  week_end: "2026-03-30",
  meals_planned: 5,
  dollars_saved: 42,
  events_managed: 7,
  tasks_completed: 18,
  agent_interactions: 24,
  top_agent: "calendar_whiz",
  streak_days: 6,
  personal_highlight: "Managed the whole soccer tournament weekend without missing a beat!",
};

interface WinsState {
  weeklyWin: WeeklyWinSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchWeeklyWin: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useWinsStore = create<WinsState>()((set) => ({
  weeklyWin: null,
  isLoading: false,
  error: null,

  fetchWeeklyWin: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = isMockMode ? MOCK_WIN : await api.wins.get(householdId);
      set({ weeklyWin: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load weekly wins.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
