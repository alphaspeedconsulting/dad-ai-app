"use client";

import { create } from "zustand";
import type { AgentType, QuickAction } from "@/types/api-contracts";
import * as api from "@/lib/api-client";
import { getMockChatResponse } from "@/lib/mock-chat-responses";
import {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
} from "@/lib/memory-store";
import { getAgentContext } from "@/lib/memory-store";
import { processAgentResponse } from "@/lib/memory-extract";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agent_type: AgentType;
  quick_actions?: QuickAction[];
  timestamp: string;
  is_tier_error?: boolean;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  isTyping: boolean;
  isHistoryLoaded: Record<string, boolean>;

  /** Load persisted chat history for an agent from IndexedDB */
  loadHistory: (agentType: AgentType) => Promise<void>;

  sendMessage: (agentType: AgentType, message: string, householdId: string) => Promise<void>;
  clearChat: (agentType: AgentType) => Promise<void>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: {},
  isTyping: false,
  isHistoryLoaded: {},

  loadHistory: async (agentType) => {
    if (get().isHistoryLoaded[agentType]) return;
    const persisted = await getChatHistory(agentType);
    const history: ChatMessage[] = persisted.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      agent_type: m.agent_type,
      timestamp: m.timestamp,
    }));
    set((state) => ({
      messages: { ...state.messages, [agentType]: history },
      isHistoryLoaded: { ...state.isHistoryLoaded, [agentType]: true },
    }));
  },

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

    if (!isMockMode) {
      await saveChatMessage(userMsg);
    }

    try {
      let response: Awaited<ReturnType<typeof api.chat.send>>;

      if (isMockMode) {
        response = await new Promise((resolve) =>
          setTimeout(() => resolve(getMockChatResponse(agentType, message)), 600 + Math.random() * 400)
        );
      } else {
        // Build memory context (top 20 relevant memories for this agent)
        const memoryItems = await getAgentContext(agentType);
        const memoryContext = memoryItems.slice(0, 20).map((m) => ({
          category: m.category,
          content: m.content,
          pinned: m.pinned,
        }));

        // Build chat history (last 20 messages for multi-turn context)
        const currentMessages = get().messages[agentType] || [];
        const chatHistory = currentMessages.slice(-20).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));

        response = await api.chat.send({
          household_id: householdId,
          agent_type: agentType,
          message,
          memory_context: memoryContext.length > 0 ? memoryContext : undefined,
          chat_history: chatHistory.length > 0 ? chatHistory : undefined,
        });
      }

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

      if (!isMockMode) {
        await saveChatMessage(agentMsg);
        // Extract and persist insights from agent response
        await processAgentResponse(agentType, response.content, response.memory_hints);
      }
    } catch (e) {
      const isTierError = e instanceof api.ApiError && e.isUpgradeRequired;
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: "agent",
        content: isTierError
          ? "This feature requires a higher subscription tier. Upgrade to unlock it."
          : e instanceof api.ApiError
          ? `Sorry, something went wrong: ${e.detail}`
          : "Sorry, I couldn't process that. Please try again.",
        agent_type: agentType,
        timestamp: new Date().toISOString(),
        is_tier_error: isTierError,
      };
      set((state) => ({
        messages: { ...state.messages, [agentType]: [...(state.messages[agentType] || []), errorMsg] },
        isTyping: false,
      }));
    }
  },

  clearChat: async (agentType) => {
    await clearChatHistory(agentType);
    set((state) => ({
      messages: { ...state.messages, [agentType]: [] },
      isHistoryLoaded: { ...state.isHistoryLoaded, [agentType]: false },
    }));
  },
}));
