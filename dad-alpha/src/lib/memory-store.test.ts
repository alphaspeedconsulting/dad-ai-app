/**
 * Unit tests for lib/memory-store.ts (IndexedDB operations)
 *
 * Uses fake-indexeddb to run IDB operations in Node/Vitest without a browser.
 */

import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  addMemory,
  updateMemory,
  deleteMemory,
  getAllMemories,
  getMemoriesByCategory,
  searchMemories,
  getAgentContext,
  saveChatMessage,
  getChatHistory,
  clearChatHistory,
  addInboxItem,
  updateInboxItem,
  deleteInboxItem,
  getAllInboxItems,
  migrateFromLocalStorage,
} from "./memory-store";

// Reset IndexedDB between tests by bumping the module cache
// fake-indexeddb is already reset per describe via beforeEach clearing stores

describe("memory-store — MemoryItem CRUD", () => {
  beforeEach(async () => {
    // Delete all existing memories by fetching and removing them
    const all = await getAllMemories();
    for (const item of all) await deleteMemory(item.id);
  });

  it("adds a memory item and returns it with id/timestamps", async () => {
    const item = await addMemory({
      category: "family_fact",
      content: "Jake is allergic to peanuts",
      tags: ["jake", "health"],
      pinned: false,
    });
    expect(item.id).toMatch(/^mem_/);
    expect(item.created_at).toBeTruthy();
    expect(item.updated_at).toBeTruthy();
    expect(item.content).toBe("Jake is allergic to peanuts");
  });

  it("retrieves all memories sorted pinned-first then by updated_at", async () => {
    await addMemory({ category: "quick_note", content: "Note A", tags: [], pinned: false });
    await addMemory({ category: "family_fact", content: "Pinned fact", tags: [], pinned: true });
    const all = await getAllMemories();
    expect(all[0].pinned).toBe(true);
  });

  it("updates a memory item", async () => {
    const item = await addMemory({ category: "quick_note", content: "Old content", tags: [], pinned: false });
    await updateMemory(item.id, { content: "New content" });
    const all = await getAllMemories();
    const updated = all.find((m) => m.id === item.id);
    expect(updated?.content).toBe("New content");
  });

  it("deletes a memory item", async () => {
    const item = await addMemory({ category: "quick_note", content: "To delete", tags: [], pinned: false });
    await deleteMemory(item.id);
    const all = await getAllMemories();
    expect(all.find((m) => m.id === item.id)).toBeUndefined();
  });

  it("filters by category", async () => {
    await addMemory({ category: "family_fact", content: "Fact", tags: [], pinned: false });
    await addMemory({ category: "routine", content: "Routine", tags: [], pinned: false });
    const facts = await getMemoriesByCategory("family_fact");
    expect(facts.every((m) => m.category === "family_fact")).toBe(true);
    expect(facts.length).toBeGreaterThanOrEqual(1);
  });

  it("searches memories by content substring", async () => {
    await addMemory({ category: "family_fact", content: "Soccer practice Tuesday", tags: [], pinned: false });
    await addMemory({ category: "quick_note", content: "Buy milk", tags: [], pinned: false });
    const results = await searchMemories("soccer");
    expect(results.some((m) => m.content.toLowerCase().includes("soccer"))).toBe(true);
    expect(results.every((m) => !m.content.toLowerCase().includes("milk"))).toBe(true);
  });
});

describe("memory-store — getAgentContext", () => {
  beforeEach(async () => {
    const all = await getAllMemories();
    for (const item of all) await deleteMemory(item.id);
  });

  it("returns pinned, family_fact, routine, important_date, and agent-tagged items", async () => {
    await addMemory({ category: "family_fact", content: "Family fact", tags: [], pinned: false });
    await addMemory({ category: "routine", content: "Routine", tags: [], pinned: false });
    await addMemory({ category: "important_date", content: "Birthday", tags: [], pinned: false });
    await addMemory({ category: "quick_note", content: "Agent note", tags: ["calendar_whiz"], pinned: false });
    await addMemory({ category: "quick_note", content: "Irrelevant note", tags: [], pinned: false });

    const ctx = await getAgentContext("calendar_whiz");
    const contents = ctx.map((m) => m.content);
    expect(contents).toContain("Family fact");
    expect(contents).toContain("Routine");
    expect(contents).toContain("Birthday");
    expect(contents).toContain("Agent note");
    expect(contents).not.toContain("Irrelevant note");
  });
});

describe("memory-store — ChatHistory", () => {
  beforeEach(async () => {
    await clearChatHistory("calendar_whiz");
    await clearChatHistory("budget_buddy");
  });

  it("saves and retrieves chat messages for an agent", async () => {
    await saveChatMessage({
      id: "msg_1",
      agent_type: "calendar_whiz",
      role: "user",
      content: "What's on my calendar?",
      timestamp: "2026-03-01T10:00:00.000Z",
    });
    await saveChatMessage({
      id: "msg_2",
      agent_type: "calendar_whiz",
      role: "agent",
      content: "You have a dentist at 2pm",
      timestamp: "2026-03-01T10:00:01.000Z",
    });

    const history = await getChatHistory("calendar_whiz");
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("agent");
  });

  it("isolates history per agent", async () => {
    await saveChatMessage({
      id: "msg_a",
      agent_type: "calendar_whiz",
      role: "user",
      content: "Calendar message",
      timestamp: "2026-03-01T10:00:00.000Z",
    });
    await saveChatMessage({
      id: "msg_b",
      agent_type: "budget_buddy",
      role: "user",
      content: "Budget message",
      timestamp: "2026-03-01T10:00:00.000Z",
    });

    const calHistory = await getChatHistory("calendar_whiz");
    expect(calHistory.every((m) => m.agent_type === "calendar_whiz")).toBe(true);
  });

  it("clears history for a specific agent only", async () => {
    await saveChatMessage({
      id: "msg_c",
      agent_type: "calendar_whiz",
      role: "user",
      content: "Hello",
      timestamp: "2026-03-01T10:00:00.000Z",
    });
    await saveChatMessage({
      id: "msg_d",
      agent_type: "budget_buddy",
      role: "user",
      content: "Budget",
      timestamp: "2026-03-01T10:00:00.000Z",
    });

    await clearChatHistory("calendar_whiz");
    expect(await getChatHistory("calendar_whiz")).toHaveLength(0);
    expect(await getChatHistory("budget_buddy")).toHaveLength(1);
  });
});

describe("memory-store — Inbox CRUD", () => {
  beforeEach(async () => {
    const all = await getAllInboxItems();
    for (const item of all) await deleteInboxItem(item.id);
  });

  it("creates an inbox item with status=captured by default", async () => {
    const item = await addInboxItem("Buy school supplies");
    expect(item.id).toMatch(/^inbox_/);
    expect(item.status).toBe("captured");
    expect(item.content).toBe("Buy school supplies");
  });

  it("creates with status=delegated when agent is assigned", async () => {
    const item = await addInboxItem("Plan meals", "grocery_guru");
    expect(item.status).toBe("delegated");
    expect(item.assigned_agent).toBe("grocery_guru");
  });

  it("updates inbox item status", async () => {
    const item = await addInboxItem("Test task");
    await updateInboxItem(item.id, { status: "done" });
    const all = await getAllInboxItems();
    const updated = all.find((i) => i.id === item.id);
    expect(updated?.status).toBe("done");
  });

  it("deletes an inbox item", async () => {
    const item = await addInboxItem("Delete me");
    await deleteInboxItem(item.id);
    const all = await getAllInboxItems();
    expect(all.find((i) => i.id === item.id)).toBeUndefined();
  });

  it("sorts active items before done/dismissed", async () => {
    const a = await addInboxItem("Active task");
    const b = await addInboxItem("Done task");
    await updateInboxItem(b.id, { status: "done" });
    const all = await getAllInboxItems();
    const activeIdx = all.findIndex((i) => i.id === a.id);
    const doneIdx = all.findIndex((i) => i.id === b.id);
    expect(activeIdx).toBeLessThan(doneIdx);
  });
});

describe("memory-store — migrateFromLocalStorage", () => {
  it("is a no-op when localStorage is empty", async () => {
    // localStorage is empty in Vitest (jsdom) by default
    await expect(migrateFromLocalStorage()).resolves.toBeUndefined();
  });
});
