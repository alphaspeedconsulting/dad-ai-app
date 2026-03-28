"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useChatStore } from "@/stores/chat-store";
import { useAgentsStore } from "@/stores/agents-store";
import { useAuthStore } from "@/stores/auth-store";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { DAD_AGENTS } from "@/config/dad-agents";
import * as api from "@/lib/api-client";
import type { AgentType, QuickAction } from "@/types/api-contracts";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_AGENTS = [
  { agent_type: "calendar_whiz" as AgentType, name: "Schedule Sync", icon: "calendar_month", description: "Manages family schedules and detects conflicts." },
  { agent_type: "school_event_hub" as AgentType, name: "School Hub", icon: "school", description: "Scans school emails and tracks permission slips." },
  { agent_type: "budget_buddy" as AgentType, name: "Expense Tracker", icon: "account_balance_wallet", description: "Tracks spending and finds savings." },
  { agent_type: "grocery_guru" as AgentType, name: "Grocery Planner", icon: "shopping_cart", description: "Builds grocery lists and plans meals." },
];

export function AgentChatClient({ agentType }: { agentType: AgentType }) {
  const router = useRouter();
  const { messages, isTyping, sendMessage, clearChat } = useChatStore();
  const { agents, fetchAgents } = useAgentsStore();
  const householdId = useAuthStore((s) => s.user?.household_id);
  const tier = useAuthStore((s) => s.user?.tier);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isListening, isSupported, transcript, startListening, stopListening, clearTranscript } = useVoiceInput();
  const isPro = tier === "family_pro";

  useEffect(() => {
    if (transcript) { setInput(transcript); clearTranscript(); }
  }, [transcript, clearTranscript]);

  const dadAgent = DAD_AGENTS.find((a) => a.agent_type === agentType);
  const mockAgent = MOCK_AGENTS.find((a) => a.agent_type === agentType);
  const agent = agents.find((a) => a.agent_type === agentType) ?? (isMockMode ? mockAgent as any : undefined);
  const chatMessages = messages[agentType] || [];

  useEffect(() => {
    if (agents.length === 0 && !isMockMode) fetchAgents();
  }, [agents.length, fetchAgents]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !householdId) return;
    sendMessage(agentType, trimmed, householdId);
    setInput("");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const appendAgentMessage = (content: string, quickActions?: QuickAction[]) => {
    const msg = {
      id: `msg_${Date.now()}_action`,
      role: "agent" as const,
      content,
      agent_type: agentType,
      quick_actions: quickActions,
      timestamp: new Date().toISOString(),
    };
    useChatStore.setState((state) => ({
      messages: {
        ...state.messages,
        [agentType]: [...(state.messages[agentType] || []), msg],
      },
    }));
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!householdId) return;

    // In mock mode or for unknown actions, fall back to sending as chat message
    if (isMockMode) {
      sendMessage(agentType, action.label, householdId);
      return;
    }

    try {
      switch (action.action) {
        case "sign_slip": {
          const slipId = action.payload?.slip_id as string;
          if (!slipId) break;
          const slip = await api.slips.sign(slipId);
          appendAgentMessage(`**Permission slip signed!** "${slip.title}" is now marked as signed.`);
          return;
        }
        case "create_event": {
          const title = action.payload?.title as string;
          if (!title) break;
          await api.calendar.create({
            title,
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 3600000).toISOString(),
          });
          appendAgentMessage(`**Event created:** "${title}" has been added to your calendar.`);
          return;
        }
        case "add_to_list": {
          const text = action.payload?.text as string;
          if (!text) break;
          await api.lists.addItem(householdId, agentType, text);
          appendAgentMessage(`**Added to list:** "${text}"`);
          return;
        }
        case "sync_google": {
          const result = await api.calendar.syncGoogle();
          appendAgentMessage(`**Calendar synced!** ${result.synced} events imported from Google Calendar.`);
          return;
        }
        case "upload_receipt": {
          fileInputRef.current?.click();
          return;
        }
        case "view_budget": {
          const [budget, summary] = await Promise.all([
            api.budget.get(householdId),
            api.expenses.summary(householdId),
          ]);
          const pct = Math.round((budget.used / budget.limit) * 100);
          appendAgentMessage(
            `**Budget status:** $${budget.used} of $${budget.limit} used (${pct}%)\n\n` +
            `**Trend:** ${summary.trend === "up" ? "Spending is up" : summary.trend === "down" ? "Spending is down" : "Spending is stable"} this month.\n\n` +
            `**Monthly total:** $${summary.total_month}`
          );
          return;
        }
        case "view_conflicts": {
          const conflicts = await api.calendar.conflicts(householdId);
          if (conflicts.length === 0) {
            appendAgentMessage("No calendar conflicts found. You're all clear!");
          } else {
            const rows = conflicts.map(
              (c) => `| ${c.date} | ${c.event_a.title} (${c.event_a.parent}) | ${c.event_b.title} (${c.event_b.parent}) | ${c.severity} |`
            );
            appendAgentMessage(
              `**${conflicts.length} conflict(s) found:**\n\n| Date | Event A | Event B | Type |\n|------|---------|---------|------|\n${rows.join("\n")}`
            );
          }
          return;
        }
        case "toggle_item": {
          const itemId = action.payload?.item_id as string;
          if (!itemId) break;
          await api.lists.toggleItem(householdId, itemId);
          appendAgentMessage("Item updated.");
          return;
        }
        case "view_expenses": {
          const summary = await api.expenses.summary(householdId);
          const categories = Object.entries(summary.by_category)
            .map(([cat, amount]) => `| ${cat} | $${amount} |`)
            .join("\n");
          appendAgentMessage(
            `**Expense breakdown:**\n\n| Category | Amount |\n|----------|--------|\n${categories}\n\n**Total:** $${summary.total_month}`
          );
          return;
        }
        default:
          break;
      }
    } catch (e) {
      const detail = e instanceof api.ApiError ? e.detail : "Something went wrong";
      appendAgentMessage(`Sorry, that action failed: ${detail}. Please try again.`);
      return;
    }

    // Fallback: send as regular chat message
    sendMessage(agentType, action.label, householdId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </button>
          {agent && (
            <>
              <div className="dad-agent-avatar bg-brand-glow/30">
                <span className="material-symbols-outlined text-[18px] text-brand">{agent.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-headline text-alphaai-base font-semibold text-foreground truncate">{agent.name}</h1>
                <p className="text-alphaai-3xs text-muted-foreground">{isTyping ? "Thinking..." : "Online"}</p>
              </div>
              {chatMessages.length > 0 && (
                <button
                  onClick={() => clearChat(agentType)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
                  title="Clear chat"
                >
                  <span className="material-symbols-outlined text-[18px] text-muted-foreground">delete_sweep</span>
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-20 pb-32 max-w-lg mx-auto w-full">
        {chatMessages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 dad-gradient-hero rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-primary">{agent?.icon ?? "smart_toy"}</span>
            </div>
            <h2 className="font-headline text-alphaai-lg font-semibold text-foreground mb-2">{agent?.name ?? "Agent"}</h2>
            <p className="text-alphaai-sm text-muted-foreground max-w-xs">{agent?.description ?? "How can I help you today?"}</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {(dadAgent?.starter_prompts ?? ["How can you help?", "What can you do?"]).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => householdId && sendMessage(agentType, prompt, householdId)}
                  className="dad-chip hover:bg-tertiary-container/80 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="dad-chat-user text-alphaai-sm">{msg.content}</div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-3 items-start">
                  <div className="dad-agent-avatar bg-brand-glow/30 flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-brand">{agent?.icon ?? "smart_toy"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="dad-chat-agent text-alphaai-sm">{renderMarkdown(msg.content)}</div>
                    {msg.quick_actions && msg.quick_actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.quick_actions.map((qa) => (
                          <button
                            key={qa.label}
                            onClick={() => handleQuickAction(qa)}
                            className="bg-brand text-on-primary text-alphaai-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="dad-agent-avatar bg-brand-glow/30 flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-brand">{agent?.icon ?? "smart_toy"}</span>
                </div>
                <div className="dad-chat-agent py-4 px-5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Hidden file input for receipt upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !householdId) return;
          e.target.value = "";
          try {
            if (isMockMode) {
              appendAgentMessage("**Receipt scanned!** (Mock mode — no file uploaded)\n\nIn production, this would process your receipt and extract expense details.");
              return;
            }
            const expense = await api.expenses.uploadReceipt(householdId, file);
            appendAgentMessage(
              `**Receipt uploaded!**\n\n- **Amount:** $${expense.amount}\n- **Category:** ${expense.category}\n- **Merchant:** ${expense.merchant ?? "Unknown"}\n- **Date:** ${expense.date}`
            );
          } catch (err) {
            const detail = err instanceof api.ApiError ? err.detail : "Upload failed";
            appendAgentMessage(`Sorry, receipt upload failed: ${detail}`);
          }
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-2xl border-t border-border-subtle/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent?.name ?? "agent"}...`}
            rows={1}
            className="dad-input resize-none flex-1 min-h-[44px] max-h-32"
          />
          {isPro && isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isListening ? "bg-error text-on-primary animate-pulse" : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{isListening ? "stop" : "mic"}</span>
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 dad-gradient-hero rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(content: string): React.ReactNode {
  const raw = marked.parse(content, { async: false }) as string;
  const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  return <div className="agent-markdown" dangerouslySetInnerHTML={{ __html: clean }} />;
}

