"use client";

import { create } from "zustand";
import * as api from "@/lib/api-client";
import type {
  AutomationRoutine,
  AutomationRoutineCreateRequest,
  HomeProject,
  HomeProjectCreateRequest,
  TripPlan,
  TripPlanCreateRequest,
  Vehicle,
  VehicleCreateRequest,
  VehicleServiceItem,
  VehicleServiceItemCreateRequest,
} from "@/types/api-contracts";

interface HouseholdOpsState {
  vehicles: Vehicle[];
  serviceItems: Record<string, VehicleServiceItem[]>; // keyed by vehicle_id
  projects: HomeProject[];
  trips: TripPlan[];
  routines: AutomationRoutine[];
  isLoading: boolean;
  error: string | null;

  fetchVehicles: (householdId: string) => Promise<void>;
  createVehicle: (householdId: string, body: VehicleCreateRequest) => Promise<Vehicle | null>;
  deleteVehicle: (householdId: string, vehicleId: string) => Promise<void>;
  fetchServiceItems: (householdId: string, vehicleId: string) => Promise<void>;
  createServiceItem: (
    householdId: string,
    vehicleId: string,
    body: VehicleServiceItemCreateRequest
  ) => Promise<VehicleServiceItem | null>;

  fetchProjects: (householdId: string) => Promise<void>;
  createProject: (householdId: string, body: HomeProjectCreateRequest) => Promise<HomeProject | null>;
  deleteProject: (householdId: string, projectId: string) => Promise<void>;

  fetchTrips: (householdId: string) => Promise<void>;
  createTrip: (householdId: string, body: TripPlanCreateRequest) => Promise<TripPlan | null>;
  deleteTrip: (householdId: string, tripId: string) => Promise<void>;

  fetchRoutines: (householdId: string) => Promise<void>;
  createRoutine: (
    householdId: string,
    body: AutomationRoutineCreateRequest
  ) => Promise<AutomationRoutine | null>;
  deleteRoutine: (householdId: string, routineId: string) => Promise<void>;

  clearError: () => void;
}

/** Checked at call time so tests can stub process.env after module load. */
function isMockMode() {
  return process.env.NEXT_PUBLIC_MOCK_MODE === "true";
}

// Mock data for offline / dev mode
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    household_id: "mock-household",
    nickname: "Family SUV",
    make: "Honda",
    model: "Pilot",
    year: 2021,
    vin: null,
    current_mileage: 34200,
    photo_url: null,
    notes: "Oil change due soon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_SERVICE_ITEMS: VehicleServiceItem[] = [
  {
    id: "s1",
    vehicle_id: "v1",
    service_type: "Oil Change",
    last_performed_at: "2025-12-01",
    last_performed_mileage: 31000,
    next_due_at: "2026-06-01",
    next_due_mileage: 36000,
    serviced_by: "Bob's Auto Shop",
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const MOCK_PROJECTS: HomeProject[] = [
  {
    id: "p1",
    household_id: "mock-household",
    title: "Backyard Fence Repair",
    description: "Replace two broken fence panels on the west side",
    status: "planned",
    estimated_cost: 450,
    area: "yard",
    checklist_id: null,
    photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_TRIPS: TripPlan[] = [
  {
    id: "t1",
    household_id: "mock-household",
    destination: "Beach Week — Outer Banks",
    start_date: "2026-07-12",
    end_date: "2026-07-19",
    estimated_budget: 2200,
    packing_checklist_id: null,
    photo_url: null,
    notes: "Book rentals by April",
    status: "planning",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_ROUTINES: AutomationRoutine[] = [
  {
    id: "r1",
    household_id: "mock-household",
    name: "Sunday Evening Wind-Down",
    steps: [
      {
        id: "rs1",
        label: "Review school lunches checklist",
        trigger_type: "checklist",
        trigger_value: null,
        order: 1,
      },
      {
        id: "rs2",
        label: "Send week preview digest to partner",
        trigger_type: "reminder",
        trigger_value: "18:00",
        order: 2,
      },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useHouseholdOpsStore = create<HouseholdOpsState>()((set, get) => ({
  vehicles: [],
  serviceItems: {},
  projects: [],
  trips: [],
  routines: [],
  isLoading: false,
  error: null,

  fetchVehicles: async (householdId) => {
    if (isMockMode()) {
      set({ vehicles: MOCK_VEHICLES });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await api.householdOps.listVehicles(householdId);
      set({ vehicles: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load vehicles.",
      });
    }
  },

  createVehicle: async (householdId, body) => {
    if (isMockMode()) {
      const vehicle: Vehicle = {
        id: `v-${Date.now()}`,
        household_id: householdId,
        make: body.make ?? null,
        model: body.model ?? null,
        year: body.year ?? null,
        vin: body.vin ?? null,
        current_mileage: body.current_mileage ?? null,
        photo_url: null,
        notes: body.notes ?? null,
        nickname: body.nickname,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((s) => ({ vehicles: [...s.vehicles, vehicle] }));
      return vehicle;
    }
    set({ isLoading: true, error: null });
    try {
      const vehicle = await api.householdOps.createVehicle(householdId, body);
      set((s) => ({ vehicles: [...s.vehicles, vehicle], isLoading: false }));
      return vehicle;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not add vehicle.",
      });
      return null;
    }
  },

  deleteVehicle: async (householdId, vehicleId) => {
    if (isMockMode()) {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== vehicleId) }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await api.householdOps.deleteVehicle(householdId, vehicleId);
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== vehicleId), isLoading: false }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not delete vehicle.",
      });
    }
  },

  fetchServiceItems: async (householdId, vehicleId) => {
    if (isMockMode()) {
      set((s) => ({ serviceItems: { ...s.serviceItems, [vehicleId]: MOCK_SERVICE_ITEMS } }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await api.householdOps.listServiceItems(householdId, vehicleId);
      set((s) => ({
        serviceItems: { ...s.serviceItems, [vehicleId]: data },
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load service items.",
      });
    }
  },

  createServiceItem: async (householdId, vehicleId, body) => {
    if (isMockMode()) {
      const item: VehicleServiceItem = {
        id: `si-${Date.now()}`,
        vehicle_id: vehicleId,
        service_type: body.service_type,
        last_performed_at: body.last_performed_at ?? null,
        last_performed_mileage: body.last_performed_mileage ?? null,
        next_due_at: body.next_due_at ?? null,
        next_due_mileage: body.next_due_mileage ?? null,
        serviced_by: body.serviced_by ?? null,
        notes: body.notes ?? null,
        created_at: new Date().toISOString(),
      };
      set((s) => ({
        serviceItems: {
          ...s.serviceItems,
          [vehicleId]: [...(s.serviceItems[vehicleId] ?? []), item],
        },
      }));
      return item;
    }
    set({ isLoading: true, error: null });
    try {
      const item = await api.householdOps.createServiceItem(householdId, vehicleId, body);
      set((s) => ({
        serviceItems: {
          ...s.serviceItems,
          [vehicleId]: [...(s.serviceItems[vehicleId] ?? []), item],
        },
        isLoading: false,
      }));
      return item;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not add service item.",
      });
      return null;
    }
  },

  fetchProjects: async (householdId) => {
    if (isMockMode()) {
      set({ projects: MOCK_PROJECTS });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await api.householdOps.listProjects(householdId);
      set({ projects: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load home projects.",
      });
    }
  },

  createProject: async (householdId, body) => {
    if (isMockMode()) {
      const project: HomeProject = {
        id: `p-${Date.now()}`,
        household_id: householdId,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? "planned",
        estimated_cost: body.estimated_cost ?? null,
        area: body.area ?? "other",
        checklist_id: null,
        photo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((s) => ({ projects: [...s.projects, project] }));
      return project;
    }
    set({ isLoading: true, error: null });
    try {
      const project = await api.householdOps.createProject(householdId, body);
      set((s) => ({ projects: [...s.projects, project], isLoading: false }));
      return project;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not add project.",
      });
      return null;
    }
  },

  deleteProject: async (householdId, projectId) => {
    if (isMockMode()) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== projectId) }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await api.householdOps.deleteProject(householdId, projectId);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== projectId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not delete project.",
      });
    }
  },

  fetchTrips: async (householdId) => {
    if (isMockMode()) {
      set({ trips: MOCK_TRIPS });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await api.householdOps.listTrips(householdId);
      set({ trips: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load trips.",
      });
    }
  },

  createTrip: async (householdId, body) => {
    if (isMockMode()) {
      const trip: TripPlan = {
        id: `t-${Date.now()}`,
        household_id: householdId,
        destination: body.destination,
        start_date: body.start_date ?? null,
        end_date: body.end_date ?? null,
        estimated_budget: body.estimated_budget ?? null,
        packing_checklist_id: null,
        photo_url: null,
        notes: body.notes ?? null,
        status: "planning",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((s) => ({ trips: [...s.trips, trip] }));
      return trip;
    }
    set({ isLoading: true, error: null });
    try {
      const trip = await api.householdOps.createTrip(householdId, body);
      set((s) => ({ trips: [...s.trips, trip], isLoading: false }));
      return trip;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not add trip.",
      });
      return null;
    }
  },

  deleteTrip: async (householdId, tripId) => {
    if (isMockMode()) {
      set((s) => ({ trips: s.trips.filter((t) => t.id !== tripId) }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await api.householdOps.deleteTrip(householdId, tripId);
      set((s) => ({ trips: s.trips.filter((t) => t.id !== tripId), isLoading: false }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not delete trip.",
      });
    }
  },

  fetchRoutines: async (householdId) => {
    if (isMockMode()) {
      set({ routines: MOCK_ROUTINES });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await api.householdOps.listRoutines(householdId);
      set({ routines: data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not load routines.",
      });
    }
  },

  createRoutine: async (householdId, body) => {
    if (isMockMode()) {
      const routine: AutomationRoutine = {
        id: `r-${Date.now()}`,
        household_id: householdId,
        name: body.name,
        steps: (body.steps ?? []).map((s, i) => ({
          id: `rs-${Date.now()}-${i}`,
          label: s.label,
          trigger_type: s.trigger_type,
          trigger_value: s.trigger_value ?? null,
          order: s.order,
        })),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((s) => ({ routines: [...s.routines, routine] }));
      return routine;
    }
    set({ isLoading: true, error: null });
    try {
      const routine = await api.householdOps.createRoutine(householdId, body);
      set((s) => ({ routines: [...s.routines, routine], isLoading: false }));
      return routine;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not add routine.",
      });
      return null;
    }
  },

  deleteRoutine: async (householdId, routineId) => {
    if (isMockMode()) {
      set((s) => ({ routines: s.routines.filter((r) => r.id !== routineId) }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await api.householdOps.deleteRoutine(householdId, routineId);
      set((s) => ({ routines: s.routines.filter((r) => r.id !== routineId), isLoading: false }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Could not delete routine.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
