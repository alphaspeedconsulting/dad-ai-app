"use client";

import { create } from "zustand";
import type { FamilyGoal } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_GOALS: FamilyGoal[] = [
  {
    id: "goal_1",
    household_id: "mock_household",
    title: "Cook at home 5 nights",
    goal_type: "meals",
    target_value: 5,
    current_value: 3,
    unit: "nights",
    period: "weekly",
    created_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: "goal_2",
    household_id: "mock_household",
    title: "Save $200 on groceries",
    goal_type: "savings",
    target_value: 200,
    current_value: 120,
    unit: "$",
    period: "monthly",
    created_at: new Date().toISOString(),
    completed_at: null,
  },
];

interface GoalsState {
  goals: FamilyGoal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = isMockMode ? MOCK_GOALS : await api.goals.list(householdId);
      set({ goals: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load goals.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
