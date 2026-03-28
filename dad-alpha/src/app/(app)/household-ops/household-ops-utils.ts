/**
 * Utility functions for household ops stats and filtering.
 * Extracted for testability — used by the household-ops page.
 */
import type {
  Vehicle,
  VehicleServiceItem,
  HomeProject,
  HomeProjectStatus,
  TripPlan,
  AutomationRoutine,
} from "@/types/api-contracts";

export function computeServiceDueCount(
  vehicles: Vehicle[],
  serviceItems: Record<string, VehicleServiceItem[]>,
  today: string
): number {
  return vehicles.filter((v) =>
    (serviceItems[v.id] ?? []).some((s) => s.next_due_at && s.next_due_at <= today)
  ).length;
}

export function computeActiveProjectsCost(projects: HomeProject[]): {
  count: number;
  totalCost: number;
} {
  const active = projects.filter(
    (p) => p.status === "planned" || p.status === "in_progress"
  );
  return {
    count: active.length,
    totalCost: active.reduce((sum, p) => sum + (p.estimated_cost ?? 0), 0),
  };
}

export function computeDaysUntilNextTrip(
  trips: TripPlan[],
  today: string
): { destination: string; days: number } | null {
  const upcoming = trips
    .filter((t) => t.start_date && t.start_date >= today)
    .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
  const next = upcoming[0];
  if (!next?.start_date) return null;
  const days = Math.ceil(
    (new Date(next.start_date).getTime() - new Date(today).getTime()) / 86400000
  );
  return { destination: next.destination, days };
}

export function filterProjectsByStatus(
  projects: HomeProject[],
  status: HomeProjectStatus | "all"
): HomeProject[] {
  if (status === "all") return projects;
  return projects.filter((p) => p.status === status);
}

export function countActiveRoutines(routines: AutomationRoutine[]): number {
  return routines.filter((r) => r.is_active).length;
}
