import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBalanceStore } from "./balance-store";

// Isolate store state between tests
beforeEach(() => {
  useBalanceStore.setState({ balance: null, isLoading: false, error: null });
});

describe("useBalanceStore — mock mode", () => {
  it("fetchBalance sets mock balance in mock mode", async () => {
    await useBalanceStore.getState().fetchBalance("mock_household");

    const { balance, isLoading, error } = useBalanceStore.getState();
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
    expect(balance).not.toBeNull();
    expect(balance!.household_id).toBe("mock_household");
  });

  it("mock balance has parent_a and parent_b", async () => {
    await useBalanceStore.getState().fetchBalance("mock_household");

    const { balance } = useBalanceStore.getState();
    expect(balance?.parent_a.name).toBe("Dad");
    expect(balance?.parent_b?.name).toBe("Mom");
    expect((balance?.parent_a.pct ?? 0) + (balance?.parent_b?.pct ?? 0)).toBe(100);
  });

  it("mock balance has by_category and weekly_trend arrays", async () => {
    await useBalanceStore.getState().fetchBalance("mock_household");

    const { balance } = useBalanceStore.getState();
    expect(balance?.by_category.length).toBeGreaterThan(0);
    expect(balance?.weekly_trend.length).toBeGreaterThan(0);
  });

  it("clearError resets error state", () => {
    useBalanceStore.setState({ error: "some error" });
    useBalanceStore.getState().clearError();
    expect(useBalanceStore.getState().error).toBeNull();
  });
});
