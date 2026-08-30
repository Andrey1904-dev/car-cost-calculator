import { supabase } from "../lib/supabaseClient";

export type MonthlyBudget = {
  id: number;
  userId: string;
  year: number;
  month: number;
  amount: number;
};

export async function loadMonthlyBudget(
  year: number,
  month: number,
): Promise<MonthlyBudget | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id, user_id, year, month, amount")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) {
    console.error(
      "Ошибка загрузки бюджета:",
      error,
    );
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    year: data.year,
    month: data.month,
    amount: Number(data.amount),
  };
}

export async function saveMonthlyBudget(
  year: number,
  month: number,
  amount: number,
): Promise<MonthlyBudget | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("monthly_budgets")
    .upsert(
      {
        user_id: user.id,
        year,
        month,
        amount,
      },
      {
        onConflict: "user_id,year,month",
      },
    )
    .select("id, user_id, year, month, amount")
    .single();

  if (error) {
    console.error(
      "Ошибка сохранения бюджета:",
      error,
    );
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    year: data.year,
    month: data.month,
    amount: Number(data.amount),
  };
}
