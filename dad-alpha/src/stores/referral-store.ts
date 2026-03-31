"use client";

import { create } from "zustand";
import type { ReferralInfo } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_REFERRAL: ReferralInfo = {
  referral_code: "DAD2026",
  referral_url: "https://dad.alphaspeedai.com?ref=DAD2026",
  friends_invited: 3,
  friends_joined: 1,
  reward_weeks_earned: 2,
  reward_weeks_used: 0,
};

interface ReferralState {
  referral: ReferralInfo | null;
  isLoading: boolean;
  error: string | null;

  fetchReferral: () => Promise<void>;
  clearError: () => void;
}

export const useReferralStore = create<ReferralState>()((set) => ({
  referral: null,
  isLoading: false,
  error: null,

  fetchReferral: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = isMockMode ? MOCK_REFERRAL : await api.referral.get();
      set({ referral: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load referral info.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
