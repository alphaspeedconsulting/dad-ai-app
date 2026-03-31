"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { EmptyState } from "@/components/shared/EmptyState";
import * as api from "@/lib/api-client";
import type { Checklist } from "@/types/api-contracts";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: "cl1",
    household_id: "",
    title: "Soccer Game Gear",
    activity_type: "sports",
    items: [
      { id: "i1", text: "Soccer cleats", checked: true },
      { id: "i2", text: "Shin guards", checked: true },
      { id: "i3", text: "Water bottle", checked: false },
      { id: "i4", text: "Snacks for team", checked: false },
      { id: "i5", text: "Folding chair", checked: false },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cl2",
    household_id: "",
    title: "Weekend Camping Trip",
    activity_type: "camping",
    items: [
      { id: "i6", text: "Tent", checked: false },
      { id: "i7", text: "Sleeping bags (x3)", checked: false },
      { id: "i8", text: "Flashlights", checked: true },
      { id: "i9", text: "First aid kit", checked: false },
      { id: "i10", text: "Marshmallows", checked: false },
      { id: "i11", text: "Bug spray", checked: false },
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function ChecklistsPage() {
  const householdId = useAuthStore((s) => s.user?.household_id);
  const [checklists, setChecklists] = useState<Checklist[]>(isMockMode ? MOCK_CHECKLISTS : []);
  const [isLoading, setIsLoading] = useState(!isMockMode);
  const [newActivity, setNewActivity] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isMockMode || !householdId) return;
    api.household
      .listChecklists(householdId)
      .then(setChecklists)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [householdId]);

  const handleGenerate = async () => {
    if (!newActivity.trim() || !householdId) return;
    setIsGenerating(true);
    if (isMockMode) {
      // Mock: simulate a brief delay then return a placeholder — dev only
      await new Promise((r) => setTimeout(r, 1000));
      const mockChecklist: Checklist = {
        id: `cl_${Date.now()}`,
        household_id: "",
        title: newActivity.trim(),
        activity_type: newActivity.trim().toLowerCase().replace(/\s+/g, "_"),
        items: [
          { id: `i_${Date.now()}_1`, text: "Item 1 (mock)", checked: false },
          { id: `i_${Date.now()}_2`, text: "Item 2 (mock)", checked: false },
          { id: `i_${Date.now()}_3`, text: "Item 3 (mock)", checked: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setChecklists((prev) => [mockChecklist, ...prev]);
    } else {
      try {
        const generated = await api.household.generateChecklist(householdId, newActivity.trim());
        setChecklists((prev) => [generated, ...prev]);
      } catch {
        // Silently no-op; no toast system yet
      }
    }
    setNewActivity("");
    setIsGenerating(false);
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cl
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/20">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Checklists</h1>
          <p className="text-alphaai-xs text-muted-foreground">Gear and packing lists for activities</p>
        </div>
      </header>

      <main id="main-content" className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Generate checklist */}
        <div className="dad-card p-4">
          <label className="text-alphaai-sm font-medium text-foreground block mb-2">
            Generate a checklist
          </label>
          <div className="flex gap-2">
            <input
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="e.g., Beach day, School field trip..."
              className="dad-input flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !newActivity.trim()}
              className="dad-btn-primary text-alphaai-xs py-2 px-4 disabled:opacity-60"
            >
              {isGenerating ? (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Checklist cards */}
        {!isLoading && checklists.length === 0 ? (
          <EmptyState
            icon="checklist"
            title="No checklists yet"
            description="Generate your first checklist by entering an activity above."
          />
        ) : (
          !isLoading &&
          checklists.map((cl) => {
            const done = cl.items.filter((i) => i.checked).length;
            return (
              <div key={cl.id} className="dad-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline text-alphaai-base font-semibold text-foreground">
                    {cl.title}
                  </h3>
                  <span className="text-alphaai-3xs text-muted-foreground">
                    {done}/{cl.items.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-surface-container rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${cl.items.length > 0 ? (done / cl.items.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  {cl.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer group py-1"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(cl.id, item.id)}
                        className="w-5 h-5 rounded accent-brand flex-shrink-0"
                      />
                      <span
                        className={`text-alphaai-sm transition-colors ${
                          item.checked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
