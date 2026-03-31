import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGoalsStore } from "./goals-store";

beforeEach(() => {
  useGoalsStore.setState({ goals: [], isLoading: false, error: null });
});

describe("useGoalsStore — mock mode", () => {
  it("fetchGoals loads mock goals", async () => {
    await useGoalsStore.getState().fetchGoals("mock_household");

    const { goals, isLoading, error } = useGoalsStore.getState();
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
    expect(goals.length).toBeGreaterThan(0);
  });

  it("mock goals have required fields", async () => {
    await useGoalsStore.getState().fetchGoals("mock_household");

    const { goals } = useGoalsStore.getState();
    for (const goal of goals) {
      expect(goal.id).toBeDefined();
      expect(goal.title).toBeDefined();
      expect(goal.goal_type).toBeDefined();
      expect(typeof goal.target_value).toBe("number");
      expect(typeof goal.current_value).toBe("number");
    }
  });

  it("mock goals belong to mock_household", async () => {
    await useGoalsStore.getState().fetchGoals("mock_household");

    const { goals } = useGoalsStore.getState();
    expect(goals.every((g) => g.household_id === "mock_household")).toBe(true);
  });

  it("clearError resets error state", () => {
    useGoalsStore.setState({ error: "some error" });
    useGoalsStore.getState().clearError();
    expect(useGoalsStore.getState().error).toBeNull();
  });
});
