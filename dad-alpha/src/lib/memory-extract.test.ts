/**
 * Unit tests for lib/memory-extract.ts
 */

import { describe, it, expect } from "vitest";
import { extractInsights } from "./memory-extract";

describe("extractInsights", () => {
  it("extracts allergy patterns as family_fact", () => {
    const insights = extractInsights("Jake is allergic to peanuts, so avoid them.");
    expect(insights.some((i) => i.category === "family_fact")).toBe(true);
    expect(insights.some((i) => i.content.toLowerCase().includes("allergic"))).toBe(true);
  });

  it("extracts birthday patterns as important_date", () => {
    const insights = extractInsights("Her birthday is March 15, so plan ahead.");
    expect(insights.some((i) => i.category === "important_date")).toBe(true);
  });

  it("extracts recurring schedule patterns as routine", () => {
    const insights = extractInsights("Every Monday soccer practice runs from 4-6pm.");
    expect(insights.some((i) => i.category === "routine")).toBe(true);
  });

  it("extracts weekly/daily recurrence keywords as routine", () => {
    const insights = extractInsights("We have a weekly standup meeting on Thursdays.");
    expect(insights.some((i) => i.category === "routine")).toBe(true);
  });

  it("extracts appointment patterns as important_date", () => {
    const insights = extractInsights("Doctor appointment scheduled on April 10.");
    expect(insights.some((i) => i.category === "important_date")).toBe(true);
  });

  it("extracts deadline patterns as important_date", () => {
    const insights = extractInsights("The deadline is June 30 for the school project.");
    expect(insights.some((i) => i.category === "important_date")).toBe(true);
  });

  it("returns empty array when no patterns match", () => {
    const insights = extractInsights("Sure, I'll help you with that.");
    expect(insights).toHaveLength(0);
  });

  it("deduplicates identical extracted content", () => {
    // Two allergy mentions in the same text — should only produce 1 insight
    const insights = extractInsights(
      "Jake is allergic to peanuts, and remember Jake is allergic to peanuts."
    );
    const texts = insights.map((i) => i.content);
    const uniqueTexts = new Set(texts);
    expect(uniqueTexts.size).toBe(texts.length);
  });
});
