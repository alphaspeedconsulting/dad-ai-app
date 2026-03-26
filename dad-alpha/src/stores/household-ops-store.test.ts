/**
 * Unit tests for useHouseholdOpsStore (mock mode).
 *
 * All tests run with NEXT_PUBLIC_MOCK_MODE truthy so no real API calls are made.
 * Tests verify that store actions correctly update state and that mock data is
 * returned for each resource type.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Ensure mock mode is active before the store module is loaded.
vi.stubEnv("NEXT_PUBLIC_MOCK_MODE", "true");

import { useHouseholdOpsStore } from "./household-ops-store";

const HOUSEHOLD_ID = "test-household";

function freshStore() {
  // Reset to initial state between tests.
  useHouseholdOpsStore.setState({
    vehicles: [],
    serviceItems: {},
    projects: [],
    trips: [],
    routines: [],
    isLoading: false,
    error: null,
  });
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

describe("useHouseholdOpsStore — vehicles (mock mode)", () => {
  beforeEach(freshStore);

  it("fetchVehicles populates vehicles with mock data", async () => {
    await useHouseholdOpsStore.getState().fetchVehicles(HOUSEHOLD_ID);
    const { vehicles } = useHouseholdOpsStore.getState();
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles[0]).toMatchObject({ nickname: expect.any(String), household_id: expect.any(String) });
  });

  it("createVehicle appends a new vehicle to state", async () => {
    await useHouseholdOpsStore.getState().fetchVehicles(HOUSEHOLD_ID);
    const beforeCount = useHouseholdOpsStore.getState().vehicles.length;

    const result = await useHouseholdOpsStore.getState().createVehicle(HOUSEHOLD_ID, {
      nickname: "Work Truck",
      make: "Ford",
      model: "F-150",
      year: 2019,
    });

    expect(result).not.toBeNull();
    expect(result?.nickname).toBe("Work Truck");
    expect(useHouseholdOpsStore.getState().vehicles).toHaveLength(beforeCount + 1);
  });

  it("deleteVehicle removes the vehicle from state", async () => {
    await useHouseholdOpsStore.getState().fetchVehicles(HOUSEHOLD_ID);
    const created = await useHouseholdOpsStore.getState().createVehicle(HOUSEHOLD_ID, {
      nickname: "To Delete",
    });
    expect(created).not.toBeNull();
    const beforeCount = useHouseholdOpsStore.getState().vehicles.length;

    await useHouseholdOpsStore.getState().deleteVehicle(HOUSEHOLD_ID, created!.id);
    expect(useHouseholdOpsStore.getState().vehicles).toHaveLength(beforeCount - 1);
    expect(
      useHouseholdOpsStore.getState().vehicles.find((v) => v.id === created!.id),
    ).toBeUndefined();
  });

  it("fetchServiceItems populates serviceItems keyed by vehicleId", async () => {
    await useHouseholdOpsStore.getState().fetchVehicles(HOUSEHOLD_ID);
    const vehicleId = useHouseholdOpsStore.getState().vehicles[0].id;

    await useHouseholdOpsStore.getState().fetchServiceItems(HOUSEHOLD_ID, vehicleId);
    const items = useHouseholdOpsStore.getState().serviceItems[vehicleId];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({ vehicle_id: expect.any(String), service_type: expect.any(String) });
  });

  it("createServiceItem appends to the vehicle's service list", async () => {
    await useHouseholdOpsStore.getState().fetchVehicles(HOUSEHOLD_ID);
    const vehicleId = useHouseholdOpsStore.getState().vehicles[0].id;
    await useHouseholdOpsStore.getState().fetchServiceItems(HOUSEHOLD_ID, vehicleId);
    const beforeCount = (useHouseholdOpsStore.getState().serviceItems[vehicleId] ?? []).length;

    const item = await useHouseholdOpsStore.getState().createServiceItem(HOUSEHOLD_ID, vehicleId, {
      service_type: "Tire Rotation",
      next_due_mileage: 40000,
    });

    expect(item).not.toBeNull();
    expect(item?.service_type).toBe("Tire Rotation");
    expect(useHouseholdOpsStore.getState().serviceItems[vehicleId]).toHaveLength(beforeCount + 1);
  });
});

// ─── Home Projects ────────────────────────────────────────────────────────────

describe("useHouseholdOpsStore — projects (mock mode)", () => {
  beforeEach(freshStore);

  it("fetchProjects populates projects with mock data", async () => {
    await useHouseholdOpsStore.getState().fetchProjects(HOUSEHOLD_ID);
    const { projects } = useHouseholdOpsStore.getState();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toMatchObject({ title: expect.any(String), status: expect.any(String) });
  });

  it("createProject appends to state", async () => {
    await useHouseholdOpsStore.getState().fetchProjects(HOUSEHOLD_ID);
    const beforeCount = useHouseholdOpsStore.getState().projects.length;

    const result = await useHouseholdOpsStore.getState().createProject(HOUSEHOLD_ID, {
      title: "Paint kitchen cabinets",
      area: "interior",
      estimated_cost: 300,
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Paint kitchen cabinets");
    expect(result?.area).toBe("interior");
    expect(result?.status).toBe("planned");
    expect(useHouseholdOpsStore.getState().projects).toHaveLength(beforeCount + 1);
  });

  it("deleteProject removes the project", async () => {
    const created = await useHouseholdOpsStore.getState().createProject(HOUSEHOLD_ID, {
      title: "Temp project",
    });
    expect(created).not.toBeNull();
    const beforeCount = useHouseholdOpsStore.getState().projects.length;

    await useHouseholdOpsStore.getState().deleteProject(HOUSEHOLD_ID, created!.id);
    expect(useHouseholdOpsStore.getState().projects).toHaveLength(beforeCount - 1);
  });
});

// ─── Trips ────────────────────────────────────────────────────────────────────

describe("useHouseholdOpsStore — trips (mock mode)", () => {
  beforeEach(freshStore);

  it("fetchTrips populates trips with mock data", async () => {
    await useHouseholdOpsStore.getState().fetchTrips(HOUSEHOLD_ID);
    const { trips } = useHouseholdOpsStore.getState();
    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0]).toMatchObject({ destination: expect.any(String), status: "planning" });
  });

  it("createTrip appends to state with status planning", async () => {
    await useHouseholdOpsStore.getState().fetchTrips(HOUSEHOLD_ID);
    const beforeCount = useHouseholdOpsStore.getState().trips.length;

    const result = await useHouseholdOpsStore.getState().createTrip(HOUSEHOLD_ID, {
      destination: "Yosemite",
      start_date: "2026-08-01",
      end_date: "2026-08-07",
      estimated_budget: 1500,
    });

    expect(result).not.toBeNull();
    expect(result?.destination).toBe("Yosemite");
    expect(result?.status).toBe("planning");
    expect(useHouseholdOpsStore.getState().trips).toHaveLength(beforeCount + 1);
  });

  it("deleteTrip removes the trip", async () => {
    const created = await useHouseholdOpsStore.getState().createTrip(HOUSEHOLD_ID, {
      destination: "TBD",
    });
    expect(created).not.toBeNull();
    const beforeCount = useHouseholdOpsStore.getState().trips.length;

    await useHouseholdOpsStore.getState().deleteTrip(HOUSEHOLD_ID, created!.id);
    expect(useHouseholdOpsStore.getState().trips).toHaveLength(beforeCount - 1);
  });
});

// ─── Routines ─────────────────────────────────────────────────────────────────

describe("useHouseholdOpsStore — routines (mock mode)", () => {
  beforeEach(freshStore);

  it("fetchRoutines populates routines with mock data", async () => {
    await useHouseholdOpsStore.getState().fetchRoutines(HOUSEHOLD_ID);
    const { routines } = useHouseholdOpsStore.getState();
    expect(routines.length).toBeGreaterThan(0);
    expect(routines[0]).toMatchObject({ name: expect.any(String), is_active: true });
  });

  it("createRoutine appends to state and is active by default", async () => {
    await useHouseholdOpsStore.getState().fetchRoutines(HOUSEHOLD_ID);
    const beforeCount = useHouseholdOpsStore.getState().routines.length;

    const result = await useHouseholdOpsStore.getState().createRoutine(HOUSEHOLD_ID, {
      name: "Monday Morning Prep",
    });

    expect(result).not.toBeNull();
    expect(result?.name).toBe("Monday Morning Prep");
    expect(result?.is_active).toBe(true);
    expect(useHouseholdOpsStore.getState().routines).toHaveLength(beforeCount + 1);
  });

  it("deleteRoutine removes the routine", async () => {
    const created = await useHouseholdOpsStore.getState().createRoutine(HOUSEHOLD_ID, {
      name: "To delete",
    });
    expect(created).not.toBeNull();
    const beforeCount = useHouseholdOpsStore.getState().routines.length;

    await useHouseholdOpsStore.getState().deleteRoutine(HOUSEHOLD_ID, created!.id);
    expect(useHouseholdOpsStore.getState().routines).toHaveLength(beforeCount - 1);
  });

  it("createRoutine with steps includes steps in the returned routine", async () => {
    const result = await useHouseholdOpsStore.getState().createRoutine(HOUSEHOLD_ID, {
      name: "Weekend Routine",
      steps: [
        { label: "Review checklists", trigger_type: "checklist", order: 1 },
        { label: "Send digest", trigger_type: "reminder", trigger_value: "09:00", order: 2 },
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.steps).toHaveLength(2);
    expect(result?.steps[0].label).toBe("Review checklists");
    expect(result?.steps[1].trigger_value).toBe("09:00");
  });
});

// ─── Error and clearError ─────────────────────────────────────────────────────

describe("useHouseholdOpsStore — clearError", () => {
  beforeEach(freshStore);

  it("clearError resets the error field to null", () => {
    useHouseholdOpsStore.setState({ error: "Something went wrong" });
    expect(useHouseholdOpsStore.getState().error).toBe("Something went wrong");

    useHouseholdOpsStore.getState().clearError();
    expect(useHouseholdOpsStore.getState().error).toBeNull();
  });
});
