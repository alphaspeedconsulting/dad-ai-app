"use client";

import { create } from "zustand";
import type { CoParentBalance } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_BALANCE: CoParentBalance = {
  household_id: "mock_household",
  period: "2026-W13",
  parent_a: { name: "Dad", operator_id: "mock_dad", tasks_completed: 14, pct: 58 },
  parent_b: { name: "Mom", operator_id: "mock_mom", tasks_completed: 10, pct: 42 },
  by_category: [
    { category: "school", parent_a_pct: 65, parent_b_pct: 35 },
    { category: "meals", parent_a_pct: 40, parent_b_pct: 60 },
    { category: "errands", parent_a_pct: 70, parent_b_pct: 30 },
  ],
  weekly_trend: [
    { week: "2026-03-09", parent_a_pct: 55, parent_b_pct: 45 },
    { week: "2026-03-16", parent_a_pct: 60, parent_b_pct: 40 },
    { week: "2026-03-23", parent_a_pct: 52, parent_b_pct: 48 },
    { week: "2026-03-30", parent_a_pct: 58, parent_b_pct: 42 },
  ],
};

interface BalanceState {
  balance: CoParentBalance | null;
  isLoading: boolean;
  error: string | null;

  fetchBalance: (householdId: string) => Promise<void>;
  clearError: () => void;
}

export const useBalanceStore = create<BalanceState>()((set) => ({
  balance: null,
  isLoading: false,
  error: null,

  fetchBalance: async (householdId) => {
    set({ isLoading: true, error: null });
    try {
      const data = isMockMode ? MOCK_BALANCE : await api.balance.get(householdId);
      set({ balance: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load balance.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
