"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentType, QuickAction } from "@/types/api-contracts";
import * as api from "@/lib/api-client";
import { getMockChatResponse } from "@/lib/mock-chat-responses";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agent_type: AgentType;
  quick_actions?: QuickAction[];
  timestamp: string;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  isTyping: boolean;
  sendMessage: (agentType: AgentType, message: string, householdId: string) => Promise<void>;
  clearChat: (agentType: AgentType) => void;
}

const MAX_MESSAGES_PER_AGENT = 50;

function trimMessages(messages: Record<string, ChatMessage[]>): Record<string, ChatMessage[]> {
  const trimmed: Record<string, ChatMessage[]> = {};
  for (const [key, msgs] of Object.entries(messages)) {
    trimmed[key] = msgs.slice(-MAX_MESSAGES_PER_AGENT);
  }
  return trimmed;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
  messages: {},
  isTyping: false,

  sendMessage: async (agentType, message, householdId) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message,
      agent_type: agentType,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: { ...state.messages, [agentType]: [...(state.messages[agentType] || []), userMsg] },
      isTyping: true,
    }));

    try {
      const response = isMockMode
        ? await new Promise<Awaited<ReturnType<typeof api.chat.send>>>((resolve) =>
            setTimeout(() => resolve(getMockChatResponse(agentType, message)), 600 + Math.random() * 400)
          )
        : await api.chat.send({ household_id: householdId, agent_type: agentType, message });
      const agentMsg: ChatMessage = {
        id: response.message_id,
        role: "agent",
        content: response.content,
        agent_type: agentType,
        quick_actions: response.quick_actions,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: { ...state.messages, [agentType]: [...(state.messages[agentType] || []), agentMsg] },
        isTyping: false,
      }));
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: "agent",
        content: e instanceof api.ApiError
          ? `Sorry, something went wrong: ${e.detail}`
          : "Sorry, I couldn't process that. Please try again.",
        agent_type: agentType,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: { ...state.messages, [agentType]: [...(state.messages[agentType] || []), errorMsg] },
        isTyping: false,
      }));
    }
  },

  clearChat: (agentType) =>
    set((state) => ({ messages: { ...state.messages, [agentType]: [] } })),
}),
    {
      name: "dad-alpha-chat",
      partialize: (state) => ({ messages: trimMessages(state.messages) }),
    },
  ),
);
