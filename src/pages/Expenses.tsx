import { useEffect, useMemo, useState } from "react";
import type {
  Category,
  Expense,
  UserName,
} from "../types/expense";

import {
  categories,
  categoryIcons,
  userIcons,
} from "../types/expense";

import { supabase } from "../lib/supabaseClient";

import {
  getTotal,
  getCategoryTotals,
  getAverageDailyExpense,
  getLargestExpense,
  getMonthExpenses,
} from "../utils/calculations";

import {
  getToday,
  formatDate,
  monthNames,
} from "../utils/dates";

import {
  loadExpenses,
  addExpenseToSupabase,
  deleteExpenseFromSupabase,
} from "../utils/storage";

type ExpenseFilter = "all" | UserName;

function getUserNameFromEmail(
  email: string | undefined,
): UserName {
  if (
    email?.toLowerCase() ===
    "zaichonok@mail.ru"
  ) {
    return "Зайчонок";
  }

  return "Заяц";
}

function Expenses() {
  const today = getToday();
  const currentDate = new Date();

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState<Category>("Продукты");

  const [comment, setComment] =
    useState("");

  const [expenseDate, setExpenseDate] =
    useState(today);

  const [userName, setUserName] =
    useState<UserName>("Заяц");

  const [filter, setFilter] =
    useState<ExpenseFilter>("all");

  const [selectedYear, setSelectedYear] =
    useState(
      currentDate.getFullYear(),
    );

  const [selectedMonth, setSelectedMonth] =
    useState(
      currentDate.getMonth(),
    );

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUserName =
        getUserNameFromEmail(
          user?.email,
        );

      setUserName(currentUserName);
    }

    getCurrentUser();
  }, []);

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);

      const data =
        await loadExpenses();

      setExpenses(data);
      setLoading(false);
    }

    fetchExpenses();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("expenses-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        async () => {
          const updatedExpenses =
            await loadExpenses();

          setExpenses(updatedExpenses);
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
      if (filter === "all") {
        return expenses;
      }

      return expenses.filter(
        (expense) =>
          expense.userName === filter,
      );
    }, [expenses, filter]);

  const monthExpenses =
    useMemo(
      () =>
        getMonthExpenses(
          filteredExpenses,
          selectedYear,
          selectedMonth,
        ),
      [
        filteredExpenses,
        selectedYear,
        selectedMonth,
      ],
    );

  const todayExpenses =
    useMemo(
      () =>
        filteredExpenses.filter(
          (expense) =>
            expense.date === today,
        ),
      [filteredExpenses, today],
    );

  const monthTotal =
    getTotal(monthExpenses);

  const todayTotal =
    getTotal(todayExpenses);

  const categoryTotals =
    getCategoryTotals(
      monthExpenses,
      categories,
    );

  const averageDailyExpense =
    getAverageDailyExpense(
      monthExpenses,
    );

  const largestExpense =
    getLargestExpense(
      monthExpenses,
    );

  async function addExpense() {
    if (adding) {
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      alert(
        "Введите корректную сумму.",
      );

      return;
    }

    setAdding(true);

    const newExpense =
      await addExpenseToSupabase({
        userName,
        amount: numericAmount,
        category,
        date: expenseDate,
        comment: comment.trim(),
      });

    if (!newExpense) {
      alert(
        "Не удалось добавить расход.",
      );

      setAdding(false);
      return;
    }

    setAmount("");
    setComment("");

    const selectedDate =
      new Date(
        `${expenseDate}T00:00:00`,
      );

    setSelectedYear(
      selectedDate.getFullYear(),
    );

    setSelectedMonth(
      selectedDate.getMonth(),
    );

    const updatedExpenses =
      await loadExpenses();

    setExpenses(updatedExpenses);

    setAdding(false);
  }

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

    const updatedExpenses =
      await loadExpenses();

    setExpenses(updatedExpenses);
  }

  function changeMonth(
    direction: number,
  ) {
    const newDate =
      new Date(
        selectedYear,
        selectedMonth +
          direction,
        1,
      );

    setSelectedYear(
      newDate.getFullYear(),
    );

    setSelectedMonth(
      newDate.getMonth(),
    );
  }

  function goToCurrentMonth() {
    setSelectedYear(
      currentDate.getFullYear(),
    );

    setSelectedMonth(
      currentDate.getMonth(),
    );
  }

  return (
    <main className="container">
      <h1>Расходы</h1>

      <p className="subtitle">
        Общие расходы Зайца и
        Зайчонка
      </p>

      <section className="person-filter">
        <button
          type="button"
          className={
            filter === "all"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setFilter("all")
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
            filter === "Заяц"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setFilter("Заяц")
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
            filter === "Зайчонок"
              ? "person-filter-button active"
              : "person-filter-button"
          }
          onClick={() =>
            setFilter(
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
            Сегодня
          </span>

          <strong>
            {todayTotal.toLocaleString(
              "ru-RU",
            )}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            {monthNames[
              selectedMonth
            ]}{" "}
            {selectedYear}
          </span>

          <strong>
            {monthTotal.toLocaleString(
              "ru-RU",
            )}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Средний расход
          </span>

          <strong>
            {Math.round(
              averageDailyExpense,
            ).toLocaleString(
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
            {monthExpenses.length}
          </strong>
        </div>
      </section>

      <section className="month-selector">
        <button
          type="button"
          onClick={() =>
            changeMonth(-1)
          }
        >
          ←
        </button>

        <div>
          <strong>
            {monthNames[
              selectedMonth
            ]}{" "}
            {selectedYear}
          </strong>

          <span>
            {loading
              ? "Загрузка..."
              : `${monthExpenses.length} операций`}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            changeMonth(1)
          }
        >
          →
        </button>
      </section>

      <button
        type="button"
        className="current-month-button"
        onClick={
          goToCurrentMonth
        }
      >
        Текущий месяц
      </button>

      <section className="card">
        <h2>
          Добавить расход
        </h2>

        <div className="current-user">
          <span>
            {userIcons[userName]}
          </span>

          <div>
            <small>
              Расход добавляет
            </small>

            <strong>
              {userName}
            </strong>
          </div>
        </div>

        <label>
          Дата

          <input
            type="date"
            value={expenseDate}
            onChange={(event) =>
              setExpenseDate(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Сумма

          <input
            type="number"
            min="0"
            step="1"
            placeholder="1000"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Категория

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as Category,
              )
            }
          >
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {
                    categoryIcons[
                      item
                    ]
                  }{" "}
                  {item}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Комментарий

          <input
            type="text"
            placeholder="Например: продукты домой"
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value,
              )
            }
          />
        </label>

        <button
          type="button"
          className="add-button"
          onClick={
            addExpense
          }
          disabled={
            loading || adding
          }
        >
          {adding
            ? "Добавляем..."
            : "+ Добавить расход"}
        </button>
      </section>

      <section className="statistics">
        <h2>
          Структура расходов
        </h2>

        {categoryTotals.length ===
        0 ? (
          <p className="empty">
            В этом месяце
            расходов пока
            нет.
          </p>
        ) : (
          <div className="expense-structure">
            {categoryTotals.map(
              (item) => (
                <div
                  className="expense-structure-item"
                  key={
                    item.category
                  }
                >
                  <div className="expense-structure-name">
                    <span className="expense-structure-icon">
                      {
                        categoryIcons[
                          item.category
                        ]
                      }
                    </span>

                    <strong>
                      {
                        item.category
                      }
                    </strong>
                  </div>

                  <strong className="expense-structure-amount">
                    {item.total.toLocaleString(
                      "ru-RU",
                    )}{" "}
                    ₽
                  </strong>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {largestExpense && (
        <section className="card">
          <h2>
            Самый большой
            расход
          </h2>

          <div className="largest-expense">
            <span>
              {
                categoryIcons[
                  largestExpense.category
                ]
              }
            </span>

            <div>
              <strong>
                {largestExpense.amount.toLocaleString(
                  "ru-RU",
                )}{" "}
                ₽
              </strong>

              <p>
                {
                  largestExpense.category
                }
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="expenses-section">
        <h2>
          Все расходы за{" "}
          {monthNames[
            selectedMonth
          ].toLowerCase()}
        </h2>

        {loading ? (
          <p className="empty">
            Загружаем
            расходы...
          </p>
        ) : monthExpenses.length ===
          0 ? (
          <p className="empty">
            В этом месяце
            расходов ещё
            нет.
          </p>
        ) : (
          <div className="expense-list">
            {monthExpenses
              .slice()
              .reverse()
              .map(
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
        )}
      </section>
    </main>
  );
}

export default Expenses;