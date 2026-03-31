"use client";

import { create } from "zustand";
import type { FamilyTemplate } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

interface TemplatesState {
  templates: FamilyTemplate[];
  isLoading: boolean;
  error: string | null;

  fetchTemplates: (category?: string) => Promise<void>;
  clearError: () => void;
}

export const useTemplatesStore = create<TemplatesState>()((set) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.templates.list(category);
      set({ templates: data.templates, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load templates.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
