import { describe, expect, it } from "vitest";
import { DAD_AGENTS, DAD_MVP_AGENT_TYPES } from "./dad-agents";

describe("DAD_MVP_AGENT_TYPES", () => {
  it("lists four agents for chat static export", () => {
    expect(DAD_MVP_AGENT_TYPES).toHaveLength(4);
    expect(DAD_MVP_AGENT_TYPES).toEqual([
      "calendar_whiz",
      "school_event_hub",
      "budget_buddy",
      "grocery_guru",
    ]);
  });

  it("matches DAD_AGENTS order and slugs", () => {
    expect(DAD_AGENTS.map((a) => a.agent_type)).toEqual([...DAD_MVP_AGENT_TYPES]);
  });

  it("calendar_whiz capabilities include household ops modes (Option B)", () => {
    const calendarAgent = DAD_AGENTS.find((a) => a.agent_type === "calendar_whiz");
    expect(calendarAgent).toBeDefined();
    expect(calendarAgent!.capabilities).toContain("Vehicle service due dates");
    expect(calendarAgent!.capabilities).toContain("Trip date planning");
  });

  it("budget_buddy capabilities include household ops modes (Option B)", () => {
    const budgetAgent = DAD_AGENTS.find((a) => a.agent_type === "budget_buddy");
    expect(budgetAgent).toBeDefined();
    expect(budgetAgent!.capabilities).toContain("Car & home project costs");
    expect(budgetAgent!.capabilities).toContain("Trip budget tracking");
  });

  it("every agent has a non-empty capabilities array", () => {
    for (const agent of DAD_AGENTS) {
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });
});
