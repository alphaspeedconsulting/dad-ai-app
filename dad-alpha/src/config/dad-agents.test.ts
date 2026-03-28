import { describe, expect, it } from "vitest";
import { DAD_AGENTS, DAD_MVP_AGENT_TYPES } from "./dad-agents";
import type { AgentCapability } from "./dad-agents";

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
    const labels = calendarAgent!.capabilities.map((c) => c.label);
    expect(labels).toContain("Vehicle service due dates");
    expect(labels).toContain("Trip date planning");
  });

  it("budget_buddy capabilities include household ops modes (Option B)", () => {
    const budgetAgent = DAD_AGENTS.find((a) => a.agent_type === "budget_buddy");
    expect(budgetAgent).toBeDefined();
    const labels = budgetAgent!.capabilities.map((c) => c.label);
    expect(labels).toContain("Car & home project costs");
    expect(labels).toContain("Trip budget tracking");
  });

  it("every agent has a non-empty capabilities array", () => {
    for (const agent of DAD_AGENTS) {
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });
});

describe("AgentCapability structure", () => {
  const allCapabilities: AgentCapability[] = DAD_AGENTS.flatMap((a) => a.capabilities);

  it("every capability has label, action, and icon", () => {
    for (const cap of allCapabilities) {
      expect(cap.label).toBeTruthy();
      expect(cap.action).toBeTruthy();
      expect(cap.icon).toBeTruthy();
    }
  });

  it("action keys are unique across all agents", () => {
    const actions = allCapabilities.map((c) => c.action);
    expect(new Set(actions).size).toBe(actions.length);
  });
});

describe("starter_prompts", () => {
  it("every agent has at least 3 starter prompts", () => {
    for (const agent of DAD_AGENTS) {
      expect(agent.starter_prompts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("starter prompts are non-empty strings", () => {
    for (const agent of DAD_AGENTS) {
      for (const prompt of agent.starter_prompts) {
        expect(prompt.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("color tokens", () => {
  it("every agent has a color token", () => {
    for (const agent of DAD_AGENTS) {
      expect(agent.color).toBeTruthy();
    }
  });
});
