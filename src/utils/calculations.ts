import type { Category, Expense } from "../types/expense";

export function getMonthExpenses(
  expenses: Expense[],
  year: number,
  month: number,
) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  return expenses.filter((expense) =>
    expense.date.startsWith(prefix),
  );
}

export function getTotal(expenses: Expense[]) {
  return expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
}

export function getCategoryTotals(
  expenses: Expense[],
  categories: Category[],
) {
  return categories
    .map((category) => ({
      category,
      total: getTotal(
        expenses.filter(
          (expense) => expense.category === category,
        ),
      ),
    }))
    .filter((item) => item.total > 0);
}

export function getAverageDailyExpense(
  expenses: Expense[],
) {
  if (expenses.length === 0) {
    return 0;
  }

  const total = getTotal(expenses);

  const uniqueDays = new Set(
    expenses.map((expense) => expense.date),
  ).size;

  return total / uniqueDays;
}

export function getLargestExpense(
  expenses: Expense[],
) {
  if (expenses.length === 0) {
    return null;
  }

  return expenses.reduce((largest, expense) =>
    expense.amount > largest.amount
      ? expense
      : largest,
  );
}