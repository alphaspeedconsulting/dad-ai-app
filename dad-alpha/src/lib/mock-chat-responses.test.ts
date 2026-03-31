import { describe, expect, it } from "vitest";
import { getMockChatResponse, AGENT_RESPONSES } from "./mock-chat-responses";
import { HANDLED_QUICK_ACTIONS } from "@/components/chat/AgentChatClient";
import { DAD_MVP_AGENT_TYPES } from "@/config/dad-agents";
import type { AgentType } from "@/types/api-contracts";

/**
 * Actions that intentionally fall through to sendMessage (chat fallback).
 * This list is the explicit contract — add here when a new unhandled action
 * is introduced in mock responses so it is a conscious, visible decision.
 *
 * Note: reschedule_event carries a payload.event_id that is silently dropped
 * in the fallback; add an explicit handler to AgentChatClient when the API is ready.
 */
const KNOWN_FALLTHROUGH_ACTIONS = new Set([
  "view_today",
  "view_week",
  "view_vehicle_service",
  "view_trips",
  "view_slips",
  "view_school_events",
  "view_deadlines",
  "view_list",
  "plan_meals",
  "suggest_recipe",
  "view_bills",
  "reschedule_event",
  // Phase 4: new agent fallthrough actions
  "view_tutors",
  "book_session",
  "view_health_records",
  "set_sleep_reminder",
  "view_sleep_trends",
  "log_checkin",
  "schedule_workout",
]);

describe("getMockChatResponse", () => {
  it("returns a valid ChatResponse for every MVP agent", () => {
    for (const agentType of DAD_MVP_AGENT_TYPES) {
      const response = getMockChatResponse(agentType, "test message");
      expect(response.message_id).toBeTruthy();
      expect(response.agent_type).toBe(agentType);
      expect(response.content).toBeTruthy();
      expect(response.intent_type).toBeTruthy();
      expect(response.model_used).toBe("mock");
    }
  });

  it("returns responses with quick_actions", () => {
    for (const agentType of DAD_MVP_AGENT_TYPES) {
      const response = getMockChatResponse(agentType, "test");
      expect(response.quick_actions).toBeDefined();
      expect(response.quick_actions!.length).toBeGreaterThan(0);
      for (const qa of response.quick_actions!) {
        expect(qa.label).toBeTruthy();
        expect(qa.action).toBeTruthy();
      }
    }
  });

  it("cycles through responses on repeated calls", () => {
    const first = getMockChatResponse("calendar_whiz" as AgentType, "test");
    const second = getMockChatResponse("calendar_whiz" as AgentType, "test");
    expect(first.content).not.toBe(second.content);
  });

  it("returns markdown content (contains formatting)", () => {
    for (const agentType of DAD_MVP_AGENT_TYPES) {
      const response = getMockChatResponse(agentType, "test");
      const hasMarkdown = response.content.includes("**") ||
        response.content.includes("|") ||
        response.content.includes("- ");
      expect(hasMarkdown).toBe(true);
    }
  });
});

describe("quick action coverage", () => {
  it("every quick action in mock responses is handled or listed as a known fallthrough", () => {
    const unknown: string[] = [];

    for (const [agentType, responses] of Object.entries(AGENT_RESPONSES)) {
      for (const response of responses) {
        for (const qa of response.quick_actions ?? []) {
          if (
            !HANDLED_QUICK_ACTIONS.has(qa.action) &&
            !KNOWN_FALLTHROUGH_ACTIONS.has(qa.action)
          ) {
            unknown.push(`${agentType}: "${qa.action}" (label: "${qa.label}")`);
          }
        }
      }
    }

    expect(
      unknown,
      `Unknown quick actions — add to HANDLED_QUICK_ACTIONS in AgentChatClient or KNOWN_FALLTHROUGH_ACTIONS here:\n${unknown.join("\n")}`
    ).toHaveLength(0);
  });

  it("HANDLED_QUICK_ACTIONS and KNOWN_FALLTHROUGH_ACTIONS have no overlap", () => {
    const overlap = [...HANDLED_QUICK_ACTIONS].filter((a) => KNOWN_FALLTHROUGH_ACTIONS.has(a));
    expect(overlap, `Actions appear in both sets: ${overlap.join(", ")}`).toHaveLength(0);
  });
});
