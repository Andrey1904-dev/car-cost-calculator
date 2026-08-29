import type {
  Expense,
  UserName,
} from "../types/expense";
import { supabase } from "../lib/supabaseClient";

type SupabaseExpense = {
  id: number;
  user_name: UserName;
  amount: number;
  category: string;
  expense_date: string;
  comment: string | null;
  created_at: string;
};

function mapExpense(
  expense: SupabaseExpense,
): Expense {
  return {
    id: expense.id,
    userName: expense.user_name,
    amount: Number(expense.amount),
    category:
      expense.category as Expense["category"],
    date: expense.expense_date,
    comment: expense.comment ?? "",
  };
}

export async function loadExpenses(): Promise<
  Expense[]
> {
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, user_name, amount, category, expense_date, comment, created_at",
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Ошибка загрузки расходов:",
      error,
    );

    return [];
  }

  return (data as SupabaseExpense[]).map(
    mapExpense,
  );
}

export async function addExpenseToSupabase(
  expense: Omit<Expense, "id">,
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_name: expense.userName,
      amount: expense.amount,
      category: expense.category,
      expense_date: expense.date,
      comment: expense.comment,
    })
    .select(
      "id, user_name, amount, category, expense_date, comment, created_at",
    )
    .single();

  if (error) {
    console.error(
      "Ошибка добавления расхода:",
      error,
    );

    return null;
  }

  return mapExpense(
    data as SupabaseExpense,
  );
}

export async function deleteExpenseFromSupabase(
  id: number,
): Promise<boolean> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Ошибка удаления расхода:",
      error,
    );

    return false;
  }

  return true;
}