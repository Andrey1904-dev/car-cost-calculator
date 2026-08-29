import type { Expense } from "../types/expense";

const STORAGE_KEY = "car-cost-expenses";

export function loadExpenses(): Expense[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(expenses),
  );
}