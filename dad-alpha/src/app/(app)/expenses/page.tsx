"use client";

import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Expense {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
}

const CATEGORIES = ["Groceries", "Gas", "Dining", "Education", "Sports", "Healthcare", "Other"];
const CATEGORY_ICONS: Record<string, string> = {
  Groceries: "shopping_cart",
  Gas: "local_gas_station",
  Dining: "restaurant",
  Education: "school",
  Sports: "sports_soccer",
  Healthcare: "health_and_safety",
  Other: "receipt_long",
};

const MOCK_EXPENSES: Expense[] = [
  { id: "e1", amount: 127.50, category: "Groceries", merchant: "Costco", date: "2026-03-25" },
  { id: "e2", amount: 47.00, category: "Gas", merchant: "Shell", date: "2026-03-24" },
  { id: "e3", amount: 35.99, category: "Dining", merchant: "Chipotle", date: "2026-03-24" },
  { id: "e4", amount: 89.00, category: "Education", merchant: "Math Tutor", date: "2026-03-23" },
  { id: "e5", amount: 45.00, category: "Sports", merchant: "Soccer League", date: "2026-03-22" },
  { id: "e6", amount: 12.99, category: "Groceries", merchant: "Target", date: "2026-03-22" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Groceries");

  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const handleAdd = () => {
    if (!amount || !merchant.trim()) return;
    const newExpense: Expense = {
      id: `e_${Date.now()}`,
      amount: parseFloat(amount),
      category,
      merchant: merchant.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setAmount("");
    setMerchant("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Expenses</h1>
            <p className="text-alphaai-xs text-muted-foreground">Track family spending</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            aria-label={showForm ? "Close expense form" : "Add expense"}
            className="w-10 h-10 dad-gradient-hero rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined dad-icon-md text-on-primary">
              {showForm ? "close" : "add"}
            </span>
          </button>
        </div>
      </header>

      <main id="main-content" className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Monthly summary */}
        <div className="dad-gradient-hero rounded-2xl p-5 text-on-primary">
          <p className="text-alphaai-xs opacity-80">This month</p>
          <p className="font-headline text-alphaai-3xl font-bold">
            ${totalMonth.toFixed(2)}
          </p>
          <div className="flex gap-4 mt-3">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([cat, amt]) => (
                <div key={cat} className="text-alphaai-3xs">
                  <span className="opacity-70">{cat}</span>
                  <span className="block font-semibold">${amt.toFixed(0)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Add expense form */}
        {showForm && (
          <div className="dad-card p-4 space-y-3">
            <h3 className="font-headline text-alphaai-base font-semibold text-foreground">
              Add Expense
            </h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount ($)"
              aria-label="Expense amount"
              step="0.01"
              className="dad-input"
            />
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Merchant / Description"
              aria-label="Merchant or description"
              className="dad-input"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-alphaai-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-brand text-on-primary"
                      : "bg-surface-container text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              disabled={!amount || !merchant.trim()}
              className="dad-btn-primary w-full disabled:opacity-60"
            >
              Add Expense
            </button>
          </div>
        )}

        {/* Expense list */}
        {expenses.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No expenses yet"
            description="Tap + to track your first family expense."
          />
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="dad-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined dad-icon-sm text-brand">
                    {CATEGORY_ICONS[exp.category] ?? "receipt_long"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-alphaai-sm font-medium text-foreground truncate">
                    {exp.merchant}
                  </p>
                  <p className="text-alphaai-3xs text-muted-foreground">
                    {exp.category} · {exp.date}
                  </p>
                </div>
                <span className="text-alphaai-base font-semibold text-foreground flex-shrink-0">
                  ${exp.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
