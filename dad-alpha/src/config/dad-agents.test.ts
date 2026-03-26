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
});
