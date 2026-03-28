import { describe, expect, it } from "vitest";
import {
  computeServiceDueCount,
  computeActiveProjectsCost,
  computeDaysUntilNextTrip,
  filterProjectsByStatus,
  countActiveRoutines,
} from "./household-ops-utils";
import type {
  Vehicle,
  VehicleServiceItem,
  HomeProject,
  TripPlan,
  AutomationRoutine,
} from "@/types/api-contracts";

const makeVehicle = (id: string): Vehicle => ({
  id,
  household_id: "h1",
  nickname: `Vehicle ${id}`,
  make: null,
  model: null,
  year: null,
  vin: null,
  current_mileage: null,
  photo_url: null,
  notes: null,
  created_at: "",
  updated_at: "",
});

const makeServiceItem = (vehicleId: string, nextDueAt: string | null): VehicleServiceItem => ({
  id: `s-${vehicleId}`,
  vehicle_id: vehicleId,
  service_type: "Oil Change",
  last_performed_at: null,
  last_performed_mileage: null,
  next_due_at: nextDueAt,
  next_due_mileage: null,
  serviced_by: null,
  notes: null,
  created_at: "",
});

const makeProject = (id: string, status: HomeProject["status"], cost: number | null): HomeProject => ({
  id,
  household_id: "h1",
  title: `Project ${id}`,
  description: null,
  status,
  estimated_cost: cost,
  area: "other",
  checklist_id: null,
  photo_url: null,
  created_at: "",
  updated_at: "",
});

const makeTrip = (id: string, startDate: string | null): TripPlan => ({
  id,
  household_id: "h1",
  destination: `Trip ${id}`,
  start_date: startDate,
  end_date: null,
  estimated_budget: null,
  packing_checklist_id: null,
  photo_url: null,
  notes: null,
  status: "planning",
  created_at: "",
  updated_at: "",
});

const makeRoutine = (id: string, isActive: boolean): AutomationRoutine => ({
  id,
  household_id: "h1",
  name: `Routine ${id}`,
  steps: [],
  is_active: isActive,
  created_at: "",
  updated_at: "",
});

describe("computeServiceDueCount", () => {
  it("counts vehicles with overdue service items", () => {
    const vehicles = [makeVehicle("v1"), makeVehicle("v2")];
    const serviceItems = {
      v1: [makeServiceItem("v1", "2026-01-01")],
      v2: [makeServiceItem("v2", "2026-12-01")],
    };
    expect(computeServiceDueCount(vehicles, serviceItems, "2026-03-28")).toBe(1);
  });

  it("returns 0 when no service is due", () => {
    const vehicles = [makeVehicle("v1")];
    const serviceItems = {
      v1: [makeServiceItem("v1", "2027-01-01")],
    };
    expect(computeServiceDueCount(vehicles, serviceItems, "2026-03-28")).toBe(0);
  });

  it("handles vehicles with no service items", () => {
    const vehicles = [makeVehicle("v1")];
    expect(computeServiceDueCount(vehicles, {}, "2026-03-28")).toBe(0);
  });
});

describe("computeActiveProjectsCost", () => {
  it("counts active projects and sums costs", () => {
    const projects = [
      makeProject("p1", "planned", 200),
      makeProject("p2", "in_progress", 300),
      makeProject("p3", "completed", 500),
    ];
    const result = computeActiveProjectsCost(projects);
    expect(result.count).toBe(2);
    expect(result.totalCost).toBe(500);
  });

  it("handles null costs", () => {
    const projects = [makeProject("p1", "planned", null)];
    expect(computeActiveProjectsCost(projects).totalCost).toBe(0);
  });
});

describe("computeDaysUntilNextTrip", () => {
  it("returns days until next upcoming trip", () => {
    const trips = [makeTrip("t1", "2026-04-05")];
    const result = computeDaysUntilNextTrip(trips, "2026-03-28");
    expect(result).not.toBeNull();
    expect(result!.days).toBe(8);
    expect(result!.destination).toBe("Trip t1");
  });

  it("returns null when no upcoming trips", () => {
    const trips = [makeTrip("t1", "2025-01-01")];
    expect(computeDaysUntilNextTrip(trips, "2026-03-28")).toBeNull();
  });

  it("picks the soonest trip", () => {
    const trips = [makeTrip("t1", "2026-05-01"), makeTrip("t2", "2026-04-01")];
    const result = computeDaysUntilNextTrip(trips, "2026-03-28");
    expect(result!.destination).toBe("Trip t2");
  });
});

describe("filterProjectsByStatus", () => {
  const projects = [
    makeProject("p1", "planned", 100),
    makeProject("p2", "in_progress", 200),
    makeProject("p3", "completed", 300),
  ];

  it("returns all projects for 'all' filter", () => {
    expect(filterProjectsByStatus(projects, "all")).toHaveLength(3);
  });

  it("filters by specific status", () => {
    expect(filterProjectsByStatus(projects, "planned")).toHaveLength(1);
    expect(filterProjectsByStatus(projects, "planned")[0].id).toBe("p1");
  });

  it("returns empty for status with no matches", () => {
    expect(filterProjectsByStatus(projects, "on_hold")).toHaveLength(0);
  });
});

describe("countActiveRoutines", () => {
  it("counts only active routines", () => {
    const routines = [makeRoutine("r1", true), makeRoutine("r2", false), makeRoutine("r3", true)];
    expect(countActiveRoutines(routines)).toBe(2);
  });
});
