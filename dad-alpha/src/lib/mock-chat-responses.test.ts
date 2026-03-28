import { describe, expect, it } from "vitest";
import { getMockChatResponse } from "./mock-chat-responses";
import { DAD_MVP_AGENT_TYPES } from "@/config/dad-agents";
import type { AgentType } from "@/types/api-contracts";

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
