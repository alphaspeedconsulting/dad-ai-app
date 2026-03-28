"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdOpsStore } from "@/stores/household-ops-store";
import type {
  HomeProjectArea,
  HomeProjectStatus,
  TripPlanCreateRequest,
  VehicleCreateRequest,
  HomeProjectCreateRequest,
  AutomationRoutineCreateRequest,
  Vehicle,
  VehicleServiceItem,
  HomeProject,
  TripPlan,
  AutomationRoutine,
} from "@/types/api-contracts";

type Tab = "garage" | "home" | "trips" | "routines";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "garage", label: "Garage", icon: "directions_car" },
  { id: "home", label: "Home", icon: "home_repair_service" },
  { id: "trips", label: "Trips", icon: "flight_takeoff" },
  { id: "routines", label: "Routines", icon: "routine" },
];

const PROJECT_STATUS_LABELS: Record<HomeProjectStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
};

const PROJECT_STATUS_COLORS: Record<HomeProjectStatus, string> = {
  planned: "text-muted-foreground",
  in_progress: "text-brand",
  completed: "text-tertiary",
  on_hold: "text-secondary",
};

const AREA_LABELS: Record<HomeProjectArea, string> = {
  interior: "Interior",
  exterior: "Exterior",
  yard: "Yard",
  other: "Other",
};

// ─── Reusable UI Components ──────────────────────────────────────────────────

function StatBox({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="dad-card p-3 flex flex-col items-center gap-1 text-center flex-1 min-w-0">
      <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
      <p className="font-headline text-alphaai-md font-bold text-foreground">{value}</p>
      <p className="text-alphaai-3xs text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function FilterPill({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-alphaai-3xs font-medium whitespace-nowrap transition-colors ${
        isSelected
          ? "bg-brand text-on-primary"
          : "bg-surface-container text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function OpsStatsSummary({
  vehicles,
  serviceItems,
  projects,
  trips,
  routines,
}: {
  vehicles: Vehicle[];
  serviceItems: Record<string, VehicleServiceItem[]>;
  projects: HomeProject[];
  trips: TripPlan[];
  routines: AutomationRoutine[];
}) {
  const today = new Date().toISOString().split("T")[0];

  const serviceDueCount = Object.values(serviceItems)
    .flat()
    .filter((s) => s.next_due_at && s.next_due_at <= today).length;

  const activeProjects = projects.filter(
    (p) => p.status === "planned" || p.status === "in_progress"
  );
  const totalEstCost = activeProjects.reduce((sum, p) => sum + (p.estimated_cost ?? 0), 0);

  const upcomingTrips = trips
    .filter((t) => t.start_date && t.start_date >= today)
    .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
  const nextTrip = upcomingTrips[0];
  const daysUntilTrip = nextTrip?.start_date
    ? Math.ceil((new Date(nextTrip.start_date).getTime() - Date.now()) / 86400000)
    : null;

  const activeRoutines = routines.filter((r) => r.is_active);

  return (
    <div className="grid grid-cols-4 gap-2">
      <StatBox
        icon="directions_car"
        value={String(vehicles.length)}
        label={serviceDueCount > 0 ? `${serviceDueCount} service due` : "Vehicles"}
        color={serviceDueCount > 0 ? "text-error" : "text-brand"}
      />
      <StatBox
        icon="home_repair_service"
        value={String(activeProjects.length)}
        label={totalEstCost > 0 ? `$${totalEstCost.toLocaleString()}` : "Projects"}
        color="text-secondary"
      />
      <StatBox
        icon="flight_takeoff"
        value={nextTrip ? String(daysUntilTrip ?? 0) : String(trips.length)}
        label={nextTrip ? "days to trip" : "Trips"}
        color="text-tertiary"
      />
      <StatBox
        icon="routine"
        value={String(activeRoutines.length)}
        label="Routines"
        color="text-brand"
      />
    </div>
  );
}

function PremiumGate() {
  return (
    <div className="dad-card p-6 text-center space-y-3">
      <div className="w-14 h-14 bg-brand-glow/20 rounded-2xl flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-[28px] text-brand">workspace_premium</span>
      </div>
      <h3 className="font-headline text-alphaai-md font-semibold text-foreground">
        Family Pro feature
      </h3>
      <p className="text-alphaai-sm text-muted-foreground max-w-xs mx-auto">
        Household Ops — garage, home projects, trips, and routines — is included in the Family Pro
        plan.
      </p>
      <Link href="/settings" className="dad-btn-primary inline-block text-alphaai-sm px-6 py-2.5">
        Upgrade to Family Pro
      </Link>
    </div>
  );
}

// ─── Garage Tab ──────────────────────────────────────────────────────────────

function GarageTab({ householdId }: { householdId: string }) {
  const {
    vehicles,
    serviceItems,
    fetchVehicles,
    createVehicle,
    deleteVehicle,
    fetchServiceItems,
    isLoading,
    error,
    clearError,
  } = useHouseholdOpsStore();

  const [showForm, setShowForm] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleCreateRequest>({ nickname: "" });
  const [garageFilter, setGarageFilter] = useState<"all" | "service_due">("all");

  useEffect(() => {
    fetchVehicles(householdId);
  }, [householdId, fetchVehicles]);

  const handleSubmit = async () => {
    if (!form.nickname.trim()) return;
    const v = await createVehicle(householdId, form);
    if (v) {
      setForm({ nickname: "" });
      setShowForm(false);
    }
  };

  const handleExpand = (vehicleId: string) => {
    if (expandedVehicleId === vehicleId) {
      setExpandedVehicleId(null);
    } else {
      setExpandedVehicleId(vehicleId);
      fetchServiceItems(householdId, vehicleId);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="dad-card p-3 border border-error/20 bg-error/10">
          <p className="text-alphaai-xs text-error">{error}</p>
          <button onClick={clearError} className="text-alphaai-3xs text-error/80 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter pills */}
      {vehicles.length > 0 && (() => {
        const today = new Date().toISOString().split("T")[0];
        const dueCount = vehicles.filter((v) =>
          (serviceItems[v.id] ?? []).some((s) => s.next_due_at && s.next_due_at <= today)
        ).length;
        return (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterPill label={`All (${vehicles.length})`} isSelected={garageFilter === "all"} onClick={() => setGarageFilter("all")} />
            {dueCount > 0 && (
              <FilterPill label={`Service Due (${dueCount})`} isSelected={garageFilter === "service_due"} onClick={() => setGarageFilter("service_due")} />
            )}
          </div>
        );
      })()}

      {vehicles.length === 0 && !isLoading && (
        <div className="dad-card p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-[40px] text-muted-foreground">
            garage
          </span>
          <p className="text-alphaai-sm text-muted-foreground">
            No vehicles yet. Add your first to track maintenance.
          </p>
        </div>
      )}

      {(garageFilter === "all"
        ? vehicles
        : vehicles.filter((v) => {
            const today = new Date().toISOString().split("T")[0];
            return (serviceItems[v.id] ?? []).some((s) => s.next_due_at && s.next_due_at <= today);
          })
      ).map((vehicle: Vehicle) => (
        <div key={vehicle.id} className="dad-card overflow-hidden">
          <button
            onClick={() => handleExpand(vehicle.id)}
            className="w-full p-4 flex items-center gap-3 text-left"
          >
            {vehicle.photo_url ? (
              <img src={vehicle.photo_url} alt={vehicle.nickname} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-brand-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-brand">directions_car</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-headline text-alphaai-sm font-semibold text-foreground">
                {vehicle.nickname}
              </p>
              <p className="text-alphaai-xs text-muted-foreground">
                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                  "No details"}
                {vehicle.current_mileage != null
                  ? ` · ${vehicle.current_mileage.toLocaleString()} mi`
                  : ""}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">
              {expandedVehicleId === vehicle.id ? "expand_less" : "expand_more"}
            </span>
          </button>

          {expandedVehicleId === vehicle.id && (
            <div className="border-t border-border-subtle/10 px-4 pb-4 space-y-3 pt-3">
              {vehicle.notes && (
                <p className="text-alphaai-xs text-muted-foreground">{vehicle.notes}</p>
              )}
              <div className="space-y-2">
                <p className="text-alphaai-xs font-semibold text-foreground">Service history</p>
                {(serviceItems[vehicle.id] ?? []).length === 0 ? (
                  <p className="text-alphaai-xs text-muted-foreground">No service items logged.</p>
                ) : (
                  serviceItems[vehicle.id].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border-subtle/20 bg-surface p-3"
                    >
                      <p className="text-alphaai-xs font-medium text-foreground">
                        {item.service_type}
                        {item.serviced_by && (
                          <span className="text-muted-foreground font-normal"> — {item.serviced_by}</span>
                        )}
                      </p>
                      {item.next_due_at && (
                        <p className="text-alphaai-3xs text-muted-foreground">
                          Next due: {item.next_due_at}
                          {item.next_due_mileage != null
                            ? ` or ${item.next_due_mileage.toLocaleString()} mi`
                            : ""}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Link
                  href={`/chat/calendar_whiz?context=vehicle:${vehicle.id}`}
                  className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
                >
                  Add to calendar
                </Link>
                <Link
                  href={`/chat/budget_buddy?context=vehicle:${vehicle.id}`}
                  className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
                >
                  Log expense
                </Link>
                <button
                  onClick={() => deleteVehicle(householdId, vehicle.id)}
                  className="ml-auto text-alphaai-3xs text-error/80 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="dad-card p-4 space-y-3">
          <p className="font-headline text-alphaai-sm font-semibold text-foreground">
            Add vehicle
          </p>
          <input
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="Nickname (e.g. Family SUV)"
            className="dad-input w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.make ?? ""}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              placeholder="Make (Honda)"
              className="dad-input"
            />
            <input
              value={form.model ?? ""}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Model (Pilot)"
              className="dad-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={form.year ?? ""}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="Year"
              className="dad-input"
            />
            <input
              type="number"
              value={form.current_mileage ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  current_mileage: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Current mileage"
              className="dad-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.nickname.trim() || isLoading}
              className="dad-btn-primary text-alphaai-xs py-2 px-4 disabled:opacity-60"
            >
              Add vehicle
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="dad-btn-outline text-alphaai-xs py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full dad-card p-4 flex items-center justify-center gap-2 text-alphaai-sm text-brand font-medium hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add vehicle
        </button>
      )}
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

function HomeTab({ householdId }: { householdId: string }) {
  const { projects, fetchProjects, createProject, deleteProject, isLoading, error, clearError } =
    useHouseholdOpsStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HomeProjectCreateRequest>({ title: "", area: "other" });
  const [statusFilter, setStatusFilter] = useState<HomeProjectStatus | "all">("all");

  useEffect(() => {
    fetchProjects(householdId);
  }, [householdId, fetchProjects]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const p = await createProject(householdId, form);
    if (p) {
      setForm({ title: "", area: "other" });
      setShowForm(false);
    }
  };

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter((p) => p.status === statusFilter);

  const statusCounts = (status: HomeProjectStatus) =>
    projects.filter((p) => p.status === status).length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="dad-card p-3 border border-error/20 bg-error/10">
          <p className="text-alphaai-xs text-error">{error}</p>
          <button onClick={clearError} className="text-alphaai-3xs text-error/80 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter pills */}
      {projects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterPill label={`All (${projects.length})`} isSelected={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
          {(["planned", "in_progress", "completed", "on_hold"] as HomeProjectStatus[]).map((s) => {
            const count = statusCounts(s);
            if (count === 0) return null;
            return (
              <FilterPill
                key={s}
                label={`${PROJECT_STATUS_LABELS[s]} (${count})`}
                isSelected={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            );
          })}
        </div>
      )}

      {filteredProjects.length === 0 && !isLoading && projects.length === 0 && (
        <div className="dad-card p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-[40px] text-muted-foreground">
            home_repair_service
          </span>
          <p className="text-alphaai-sm text-muted-foreground">
            No home projects yet. Track repairs, improvements, and yard work here.
          </p>
        </div>
      )}

      {filteredProjects.map((project: HomeProject) => (
        <div key={project.id} className="dad-card overflow-hidden">
          {project.photo_url && (
            <img src={project.photo_url} alt={project.title} className="w-full h-32 object-cover" />
          )}
          <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-headline text-alphaai-sm font-semibold text-foreground">
                {project.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-alphaai-3xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                <span className="text-alphaai-3xs text-muted-foreground">
                  · {AREA_LABELS[project.area]}
                </span>
                {project.estimated_cost != null && (
                  <span className="text-alphaai-3xs text-muted-foreground">
                    · ${project.estimated_cost.toLocaleString()}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-alphaai-xs text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
            <button
              onClick={() => deleteProject(householdId, project.id)}
              className="text-alphaai-3xs text-error/60 flex-shrink-0"
              aria-label="Remove project"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/checklists?context=project:${project.id}`}
              className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
            >
              Checklist
            </Link>
            <Link
              href={`/chat/budget_buddy?context=project:${project.id}`}
              className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
            >
              Log expense
            </Link>
          </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="dad-card p-4 space-y-3">
          <p className="font-headline text-alphaai-sm font-semibold text-foreground">
            Add project
          </p>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Project name (e.g. Backyard fence repair)"
            className="dad-input w-full"
          />
          <input
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            className="dad-input w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.area ?? "other"}
              onChange={(e) => setForm({ ...form, area: e.target.value as HomeProjectArea })}
              className="dad-input"
            >
              {(["interior", "exterior", "yard", "other"] as HomeProjectArea[]).map((a) => (
                <option key={a} value={a}>
                  {AREA_LABELS[a]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={form.estimated_cost ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimated_cost: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Est. cost ($)"
              className="dad-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim() || isLoading}
              className="dad-btn-primary text-alphaai-xs py-2 px-4 disabled:opacity-60"
            >
              Add project
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="dad-btn-outline text-alphaai-xs py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full dad-card p-4 flex items-center justify-center gap-2 text-alphaai-sm text-brand font-medium hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add project
        </button>
      )}
    </div>
  );
}

// ─── Trips Tab ────────────────────────────────────────────────────────────────

function TripsTab({ householdId }: { householdId: string }) {
  const { trips, fetchTrips, createTrip, deleteTrip, isLoading, error, clearError } =
    useHouseholdOpsStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TripPlanCreateRequest>({ destination: "" });
  const [tripFilter, setTripFilter] = useState<"all" | "planning" | "booked" | "completed">("all");

  useEffect(() => {
    fetchTrips(householdId);
  }, [householdId, fetchTrips]);

  const handleSubmit = async () => {
    if (!form.destination.trim()) return;
    const t = await createTrip(householdId, form);
    if (t) {
      setForm({ destination: "" });
      setShowForm(false);
    }
  };

  const formatDateRange = (trip: TripPlan): string => {
    if (!trip.start_date) return "Dates TBD";
    if (!trip.end_date) return trip.start_date;
    return `${trip.start_date} – ${trip.end_date}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="dad-card p-3 border border-error/20 bg-error/10">
          <p className="text-alphaai-xs text-error">{error}</p>
          <button onClick={clearError} className="text-alphaai-3xs text-error/80 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter pills */}
      {trips.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterPill label={`All (${trips.length})`} isSelected={tripFilter === "all"} onClick={() => setTripFilter("all")} />
          {(["planning", "booked", "completed"] as const).map((s) => {
            const count = trips.filter((t) => t.status === s).length;
            if (count === 0) return null;
            return (
              <FilterPill
                key={s}
                label={`${s.charAt(0).toUpperCase() + s.slice(1)} (${count})`}
                isSelected={tripFilter === s}
                onClick={() => setTripFilter(s)}
              />
            );
          })}
        </div>
      )}

      {trips.length === 0 && !isLoading && (
        <div className="dad-card p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-[40px] text-muted-foreground">
            flight_takeoff
          </span>
          <p className="text-alphaai-sm text-muted-foreground">
            No trips planned. Add one to start building an itinerary, budget, and packing list.
          </p>
        </div>
      )}

      {(tripFilter === "all" ? trips : trips.filter((t) => t.status === tripFilter)).map((trip: TripPlan) => (
        <div key={trip.id} className="dad-card overflow-hidden">
          {trip.photo_url && (
            <img src={trip.photo_url} alt={trip.destination} className="w-full h-32 object-cover" />
          )}
          <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-headline text-alphaai-sm font-semibold text-foreground">
                {trip.destination}
              </p>
              <p className="text-alphaai-xs text-muted-foreground mt-0.5">
                {formatDateRange(trip)}
                {trip.estimated_budget != null
                  ? ` · $${trip.estimated_budget.toLocaleString()} budget`
                  : ""}
              </p>
              {trip.notes && (
                <p className="text-alphaai-xs text-muted-foreground mt-1">{trip.notes}</p>
              )}
            </div>
            <button
              onClick={() => deleteTrip(householdId, trip.id)}
              className="text-alphaai-3xs text-error/60 flex-shrink-0"
              aria-label="Remove trip"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/chat/calendar_whiz?context=trip:${trip.id}`}
              className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
            >
              Add to calendar
            </Link>
            <Link
              href={`/checklists?context=trip:${trip.id}`}
              className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
            >
              Packing list
            </Link>
            <Link
              href={`/chat/budget_buddy?context=trip:${trip.id}`}
              className="dad-btn-outline text-alphaai-3xs py-1.5 px-3"
            >
              Budget
            </Link>
          </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="dad-card p-4 space-y-3">
          <p className="font-headline text-alphaai-sm font-semibold text-foreground">Plan a trip</p>
          <input
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder="Destination (e.g. Beach Week — Outer Banks)"
            className="dad-input w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-alphaai-3xs text-muted-foreground">Start date</label>
              <input
                type="date"
                value={form.start_date ?? ""}
                onChange={(e) => setForm({ ...form, start_date: e.target.value || undefined })}
                className="dad-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-alphaai-3xs text-muted-foreground">End date</label>
              <input
                type="date"
                value={form.end_date ?? ""}
                onChange={(e) => setForm({ ...form, end_date: e.target.value || undefined })}
                className="dad-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={form.estimated_budget ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimated_budget: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Est. budget ($)"
              className="dad-input"
            />
            <input
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || undefined })}
              placeholder="Notes (optional)"
              className="dad-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.destination.trim() || isLoading}
              className="dad-btn-primary text-alphaai-xs py-2 px-4 disabled:opacity-60"
            >
              Add trip
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="dad-btn-outline text-alphaai-xs py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full dad-card p-4 flex items-center justify-center gap-2 text-alphaai-sm text-brand font-medium hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Plan a trip
        </button>
      )}
    </div>
  );
}

// ─── Routines Tab ─────────────────────────────────────────────────────────────

function RoutinesTab({ householdId }: { householdId: string }) {
  const {
    routines,
    fetchRoutines,
    createRoutine,
    deleteRoutine,
    isLoading,
    error,
    clearError,
  } = useHouseholdOpsStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AutomationRoutineCreateRequest>({ name: "" });

  useEffect(() => {
    fetchRoutines(householdId);
  }, [householdId, fetchRoutines]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const r = await createRoutine(householdId, form);
    if (r) {
      setForm({ name: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="dad-card p-3 border border-error/20 bg-error/10">
          <p className="text-alphaai-xs text-error">{error}</p>
          <button onClick={clearError} className="text-alphaai-3xs text-error/80 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      <div className="dad-card p-3 flex items-center gap-2 bg-surface-container-low/50">
        <span className="material-symbols-outlined text-[16px] text-muted-foreground">info</span>
        <p className="text-alphaai-3xs text-muted-foreground">
          Routines are checklist-driven reminders — not connected to smart-home devices in this
          version.
        </p>
      </div>

      {routines.length === 0 && !isLoading && (
        <div className="dad-card p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-[40px] text-muted-foreground">
            routine
          </span>
          <p className="text-alphaai-sm text-muted-foreground">
            No routines yet. Create a named sequence of reminders and checklist steps for recurring
            household moments.
          </p>
        </div>
      )}

      {routines.map((routine: AutomationRoutine) => (
        <div key={routine.id} className="dad-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  routine.is_active ? "bg-brand" : "bg-muted-foreground/40"
                }`}
              />
              <p className="font-headline text-alphaai-sm font-semibold text-foreground truncate">
                {routine.name}
              </p>
            </div>
            <button
              onClick={() => deleteRoutine(householdId, routine.id)}
              className="text-alphaai-3xs text-error/60 flex-shrink-0"
              aria-label="Remove routine"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          {routine.steps.length > 0 && (
            <ol className="mt-2 space-y-1 pl-6">
              {routine.steps
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <li
                    key={step.id}
                    className="text-alphaai-xs text-muted-foreground list-decimal"
                  >
                    {step.label}
                    {step.trigger_value && (
                      <span className="text-alphaai-3xs ml-1 text-brand/70">
                        @ {step.trigger_value}
                      </span>
                    )}
                  </li>
                ))}
            </ol>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="dad-card p-4 space-y-3">
          <p className="font-headline text-alphaai-sm font-semibold text-foreground">
            New routine
          </p>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Routine name (e.g. Sunday Evening Wind-Down)"
            className="dad-input w-full"
          />
          <p className="text-alphaai-3xs text-muted-foreground">
            Steps can be added via the agent chat after creating the routine.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || isLoading}
              className="dad-btn-primary text-alphaai-xs py-2 px-4 disabled:opacity-60"
            >
              Create routine
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="dad-btn-outline text-alphaai-xs py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full dad-card p-4 flex items-center justify-center gap-2 text-alphaai-sm text-brand font-medium hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New routine
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function HouseholdOpsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { vehicles, serviceItems, projects, trips, routines } = useHouseholdOpsStore();

  const [isMounted, setIsMounted] = useState(false);

  const initialTab = (searchParams.get("tab") as Tab) ?? "garage";
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "garage"
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) {
      router.replace("/login?mode=signup");
    }
  }, [isMounted, token, router]);

  if (!isMounted || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  const isPremium = user?.tier === "family_pro";
  const householdId = user?.household_id ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Household Ops
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">Garage · Home · Trips · Routines</p>
          </div>
          {isPremium && (
            <span className="ml-auto dad-chip text-alphaai-3xs">Family Pro</span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-28 space-y-4">
        {!isPremium ? (
          <PremiumGate />
        ) : !householdId ? (
          <div className="dad-card p-6 text-center space-y-2">
            <p className="text-alphaai-sm text-muted-foreground">
              Set up your household first in{" "}
              <Link href="/settings" className="text-brand underline">
                Settings
              </Link>{" "}
              to use Household Ops.
            </p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <OpsStatsSummary
              vehicles={vehicles}
              serviceItems={serviceItems}
              projects={projects}
              trips={trips}
              routines={routines}
            />

            {/* Tab bar */}
            <div className="flex bg-surface rounded-2xl p-1 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors text-alphaai-3xs font-medium ${
                    activeTab === tab.id
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{
                      fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "garage" && <GarageTab householdId={householdId} />}
            {activeTab === "home" && <HomeTab householdId={householdId} />}
            {activeTab === "trips" && <TripsTab householdId={householdId} />}
            {activeTab === "routines" && <RoutinesTab householdId={householdId} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function HouseholdOpsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container animate-pulse" />
        </div>
      }
    >
      <HouseholdOpsContent />
    </Suspense>
  );
}
