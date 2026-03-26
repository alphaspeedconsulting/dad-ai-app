import { AgentChatClient } from "@/components/chat/AgentChatClient";
import type { AgentType } from "@/types/api-contracts";

const DAD_AGENTS: AgentType[] = [
  "calendar_whiz",
  "school_event_hub",
  "budget_buddy",
  "grocery_guru",
];

export function generateStaticParams() {
  return DAD_AGENTS.map((agent) => ({ agent }));
}

export default async function ChatPage({ params }: { params: Promise<{ agent: string }> }) {
  const { agent } = await params;
  return <AgentChatClient agentType={agent as AgentType} />;
}
