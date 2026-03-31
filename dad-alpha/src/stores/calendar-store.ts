"use client";

import { create } from "zustand";
import type { CalendarEvent } from "@/types/api-contracts";
import * as api from "@/lib/api-client";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

type FilterType = "all" | "shared" | "dad" | "kids";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "mock_1",
    household_id: "mock_household",
    title: "Soccer Practice",
    start_at: (() => { const d = new Date(); d.setHours(15, 30, 0, 0); return d.toISOString(); })(),
    end_at: (() => { const d = new Date(); d.setHours(17, 0, 0, 0); return d.toISOString(); })(),
    all_day: false,
    source: "internal",
    external_id: null,
    member_id: null,
    member_name: "Emma",
    member_color: null,
    description: "Spring season practice",
    metadata: {},
  },
  {
    id: "mock_2",
    household_id: "mock_household",
    title: "Team Standup",
    start_at: (() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d.toISOString(); })(),
    end_at: (() => { const d = new Date(); d.setHours(10, 30, 0, 0); return d.toISOString(); })(),
    all_day: false,
    source: "google",
    external_id: null,
    member_id: null,
    member_name: "Dad",
    member_color: null,
    description: null,
    metadata: {},
  },
];

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  filter: FilterType;
  isLoading: boolean;
  error: string | null;

  fetchEvents: (params?: { start_after?: string; start_before?: string }) => Promise<void>;
  createEvent: (body: { title: string; start_at: string; end_at: string; description?: string; all_day?: boolean; member_id?: string }) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  syncGoogle: () => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setFilter: (filter: FilterType) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  selectedDate: new Date(),
  filter: "all",
  isLoading: true,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = isMockMode
        ? { events: MOCK_EVENTS }
        : await api.calendar.list(params);
      set({ events: data.events, isLoading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load events", isLoading: false });
    }
  },

  createEvent: async (body) => {
    try {
      await api.calendar.create(body);
      await get().fetchEvents();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to create event" });
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await api.calendar.delete(eventId);
      set((state) => ({ events: state.events.filter((e) => e.id !== eventId) }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to delete event" });
    }
  },

  syncGoogle: async () => {
    try {
      await api.calendar.syncGoogle();
      await get().fetchEvents();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to sync Google Calendar" });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  setFilter: (filter) => set({ filter }),

  getEventsForDate: (date) => {
    const { events, filter } = get();
    return events.filter((e) => {
      const eventDate = new Date(e.start_at);
      if (!isSameDay(eventDate, date)) return false;
      if (filter === "all") return true;
      if (filter === "shared") return !e.member_id;
      if (filter === "dad") return e.member_name === "Dad";
      if (filter === "kids") return e.member_name !== "Dad" && e.member_id !== null;
      return true;
    });
  },
}));
