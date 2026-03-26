import { AgentChatClient } from "@/components/chat/AgentChatClient";
import { DAD_MVP_AGENT_TYPES } from "@/config/dad-agents";
import type { AgentType } from "@/types/api-contracts";

export function generateStaticParams() {
  return DAD_MVP_AGENT_TYPES.map((agent) => ({ agent }));
}

export default async function ChatPage({ params }: { params: Promise<{ agent: string }> }) {
  const { agent } = await params;
  return <AgentChatClient agentType={agent as AgentType} />;
}
