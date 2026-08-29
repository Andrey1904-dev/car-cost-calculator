import { useEffect, useMemo, useState } from "react";
import type {
  Expense,
  UserName,
} from "../types/expense";

import {
  categoryIcons,
  userIcons,
} from "../types/expense";

import { supabase } from "../lib/supabaseClient";

import {
  formatDate,
} from "../utils/dates";

import {
  loadExpenses,
  deleteExpenseFromSupabase,
} from "../utils/storage";

type ExpenseFilter = "all" | UserName;

function History() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedUser, setSelectedUser] =
    useState<ExpenseFilter>("all");

  async function fetchExpenses() {
    setLoading(true);

    const data =
      await loadExpenses();

    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  /*
   * Realtime-синхронизация.
   * Если второй человек добавил или удалил
   * расход, история обновится автоматически.
   */
  useEffect(() => {
    const channel = supabase
      .channel("history-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        async () => {
          await fetchExpenses();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel,
      );
    };
  }, []);

  const filteredExpenses =
    useMemo(() => {
      if (selectedUser === "all") {
        return expenses;
      }

      return expenses.filter(
        (expense) =>
          expense.userName ===
          selectedUser,
      );
    }, [
      expenses,
      selectedUser,
    ]);

  const sortedExpenses =
    useMemo(() => {
      return filteredExpenses
        .slice()
        .sort((a, b) => {
          const dateCompare =
            b.date.localeCompare(
              a.date,
            );

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return b.id - a.id;
        });
    }, [filteredExpenses]);

  async function deleteExpense(
    id: number,
  ) {
    const confirmed =
      window.confirm(
        "Удалить этот расход?",
      );

    if (!confirmed) {
      return;
    }

    const success =
      await deleteExpenseFromSupabase(
        id,
      );

    if (!success) {
      alert(
        "Не удалось удалить расход.",
      );

      return;
    }

    setExpenses((current) =>
      current.filter(
        (expense) =>
          expense.id !== id,
      ),
    );
  }

  const total =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0,
    );

  return (
    <main className="container">
      <h1>История</h1>

      <p className="subtitle">
        Все расходы за всё время
      </p>

      <section className="person-filter">
        <button
          type="button"
          className={
            selectedUser === "all"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setSelectedUser("all")
          }
        >
          <span>🐰</span>

          <strong>
            Зайцы
          </strong>

          <small>
            Общие расходы
          </small>
        </button>

        <button
          type="button"
          className={
            selectedUser === "Заяц"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setSelectedUser("Заяц")
          }
        >
          <span>
            {userIcons.Заяц}
          </span>

          <strong>
            Заяц
          </strong>

          <small>
            Личные расходы
          </small>
        </button>

        <button
          type="button"
          className={
            selectedUser ===
            "Зайчонок"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setSelectedUser(
              "Зайчонок",
            )
          }
        >
          <span>
            {userIcons.Зайчонок}
          </span>

          <strong>
            Зайчонок
          </strong>

          <small>
            Личные расходы
          </small>
        </button>
      </section>

      <section className="summary">
        <div className="summary-card">
          <span>
            {selectedUser ===
            "all"
              ? "Все расходы"
              : selectedUser}
          </span>

          <strong>
            {total.toLocaleString(
              "ru-RU",
            )}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Операций
          </span>

          <strong>
            {filteredExpenses.length}
          </strong>
        </div>
      </section>

      {loading ? (
        <p className="empty">
          Загружаем историю...
        </p>
      ) : sortedExpenses.length ===
        0 ? (
        <p className="empty">
          Расходов пока нет.
        </p>
      ) : (
        <section className="expenses-section">
          <h2>
            {selectedUser ===
            "all"
              ? "Все расходы"
              : `Расходы: ${selectedUser}`}
          </h2>

          <div className="expense-list">
            {sortedExpenses.map(
              (expense) => (
                <div
                  className="expense"
                  key={
                    expense.id
                  }
                >
                  <div className="expense-icon">
                    {
                      categoryIcons[
                        expense.category
                      ]
                    }
                  </div>

                  <div className="expense-info">
                    <strong>
                      {
                        expense.category
                      }
                    </strong>

                    <span>
                      {
                        userIcons[
                          expense
                            .userName
                        ]
                      }{" "}
                      {
                        expense.userName
                      }{" "}
                      •{" "}
                      {formatDate(
                        expense.date,
                      )}

                      {expense.comment
                        ? ` • ${expense.comment}`
                        : ""}
                    </span>
                  </div>

                  <strong className="expense-amount">
                    {expense.amount.toLocaleString(
                      "ru-RU",
                    )}{" "}
                    ₽
                  </strong>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      deleteExpense(
                        expense.id,
                      )
                    }
                    aria-label="Удалить расход"
                  >
                    ×
                  </button>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default History;