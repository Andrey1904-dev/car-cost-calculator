import { useEffect, useMemo, useState } from "react";

import type {
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
  getAverageDailyExpense,
  getCategoryTotals,
  getLargestExpense,
  getMonthExpenses,
  getTotal,
} from "../utils/calculations";

import { monthNames } from "../utils/dates";

import { loadExpenses } from "../utils/storage";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type ExpenseFilter = "all" | UserName;

function Statistics() {
  const today = new Date();

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedUser, setSelectedUser] =
    useState<ExpenseFilter>("all");

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  // Первичная загрузка
  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);

      const data = await loadExpenses();

      setExpenses(data);
      setLoading(false);
    }

    fetchExpenses();
  }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("statistics-expenses-realtime")
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
      supabase.removeChannel(channel);
    };
  }, []);

  // Фильтр пользователя
  const filteredExpenses = useMemo(() => {
    if (selectedUser === "all") {
      return expenses;
    }

    return expenses.filter(
      (expense) =>
        expense.userName === selectedUser,
    );
  }, [expenses, selectedUser]);

  // Расходы выбранного месяца
  const monthExpenses = useMemo(
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

  // Предыдущий месяц
  const previousDate = useMemo(
    () =>
      new Date(
        selectedYear,
        selectedMonth - 1,
        1,
      ),
    [selectedYear, selectedMonth],
  );

  const previousMonthExpenses =
    useMemo(
      () =>
        getMonthExpenses(
          filteredExpenses,
          previousDate.getFullYear(),
          previousDate.getMonth(),
        ),
      [
        filteredExpenses,
        previousDate,
      ],
    );

  const total = getTotal(monthExpenses);

  const previousTotal =
    getTotal(previousMonthExpenses);

  const averageDaily =
    getAverageDailyExpense(
      monthExpenses,
    );

  const categoryTotals =
    getCategoryTotals(
      monthExpenses,
      categories,
    );

  const largestExpense =
    getLargestExpense(
      monthExpenses,
    );

  const uniqueDays = new Set(
    monthExpenses.map(
      (expense) => expense.date,
    ),
  ).size;

  // Расходы по дням
  const dailyTotals = useMemo(() => {
    const totals: Record<
      string,
      number
    > = {};

    monthExpenses.forEach(
      (expense) => {
        totals[expense.date] =
          (totals[expense.date] ||
            0) + expense.amount;
      },
    );

    return Object.entries(totals)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date),
      );
  }, [monthExpenses]);

  const chartData = useMemo(() => {
    const daysInMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
    ).getDate();

    const totalsMap = new Map(
      dailyTotals.map((item) => [
        item.date,
        item.amount,
      ]),
    );

    return Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;

        const date = `${selectedYear}-${String(
          selectedMonth + 1,
        ).padStart(2, "0")}-${String(day).padStart(
          2,
          "0",
        )}`;

        return {
          date,
          day,
          amount: totalsMap.get(date) ?? 0,
        };
      },
    );
  }, [
    dailyTotals,
    selectedYear,
    selectedMonth,
  ]);

  const topDays = useMemo(
    () =>
      dailyTotals.slice().sort((a, b) => {
        if (b.amount !== a.amount) {
          return b.amount - a.amount;
        }

        return b.date.localeCompare(
          a.date,
        );
      }),
    [dailyTotals],
  );

  const largestDay = topDays[0];

  // Изменение относительно прошлого месяца
  let monthDifference = 0;

  if (previousTotal > 0) {
    monthDifference =
      ((total - previousTotal) /
        previousTotal) *
      100;
  }

  function changeMonth(
    direction: number,
  ) {
    const newDate = new Date(
      selectedYear,
      selectedMonth + direction,
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
      today.getFullYear(),
    );

    setSelectedMonth(
      today.getMonth(),
    );
  }

  const currentMonthName =
    monthNames[selectedMonth];

  const previousMonthName =
    monthNames[
      previousDate.getMonth()
    ];

  return (
    <main className="container">
      <h1>Статистика</h1>

      <p className="subtitle">
        Анализ расходов Зайца и
        Зайчонка
      </p>

      {/* Пользователь */}

      <section className="person-filter">
        <button
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

          <strong>Зайцы</strong>

          <small>
            Общие расходы
          </small>
        </button>

        <button
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

          <strong>Заяц</strong>

          <small>
            Личные расходы
          </small>
        </button>

        <button
          className={
            selectedUser === "Зайчонок"
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

      {/* Месяц */}

      <section className="month-selector">
        <button
          onClick={() =>
            changeMonth(-1)
          }
          aria-label="Предыдущий месяц"
        >
          ←
        </button>

        <div>
          <strong>
            {currentMonthName}{" "}
            {selectedYear}
          </strong>

          <span>
            {loading
              ? "Загрузка..."
              : `${monthExpenses.length} ${
                  monthExpenses.length ===
                  1
                    ? "операция"
                    : "операций"
                }`}
          </span>
        </div>

        <button
          onClick={() =>
            changeMonth(1)
          }
          aria-label="Следующий месяц"
        >
          →
        </button>
      </section>

      <button
        className="current-month-button"
        onClick={
          goToCurrentMonth
        }
      >
        Текущий месяц
      </button>

      {/* Сводка */}

      <section className="summary">
        <div className="summary-card">
          <span>
            Всего за месяц
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
            Средний расход в день
          </span>

          <strong>
            {Math.round(
              averageDaily,
            ).toLocaleString(
              "ru-RU",
            )}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Дней с расходами
          </span>

          <strong>
            {uniqueDays}
          </strong>
        </div>

        <div className="summary-card">
          <span>Операций</span>

          <strong>
            {monthExpenses.length}
          </strong>
        </div>
      </section>

      {/* Сравнение */}

      <section className="card">
        <h2>
          Сравнение с прошлым
          месяцем
        </h2>

        {previousTotal === 0 ? (
          <div className="comparison">
            <strong>
              Нет данных
            </strong>

            <span>
              За прошлый месяц
              расходов нет
            </span>
          </div>
        ) : (
          <div className="comparison">
            <strong>
              {monthDifference > 0
                ? "+"
                : ""}
              {Math.round(
                monthDifference,
              )}
              %
            </strong>

            <span>
              {monthDifference >
              0
                ? "Расходы выросли"
                : monthDifference <
                    0
                  ? "Расходы снизились"
                  : "Расходы не изменились"}
            </span>
          </div>
        )}

        <div className="comparison-values">
          <div>
            <span>
              {currentMonthName}
            </span>

            <strong>
              {total.toLocaleString(
                "ru-RU",
              )}{" "}
              ₽
            </strong>
          </div>

          <div>
            <span>
              {previousMonthName}
            </span>

            <strong>
              {previousTotal.toLocaleString(
                "ru-RU",
              )}{" "}
              ₽
            </strong>
          </div>
        </div>
      </section>

      {/* Категории */}

      <section className="card">
        <h2>
          Расходы по категориям
        </h2>

        {categoryTotals.length ===
        0 ? (
          <p className="empty">
            За этот месяц
            расходов нет.
          </p>
        ) : (
          <div className="statistics-list">
            {categoryTotals.map(
              (item) => {
                const percentage =
                  total > 0
                    ? (item.total /
                        total) *
                      100
                    : 0;

                return (
                  <div
                    className="statistic-item"
                    key={
                      item.category
                    }
                  >
                    <div className="statistic-header">
                      <div>
                        <span>
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

                      <strong>
                        {item.total.toLocaleString(
                          "ru-RU",
                        )}{" "}
                        ₽
                      </strong>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="percentage">
                      {percentage.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* Самый большой расход */}

      {largestExpense && (
        <section className="card">
          <h2>
            Самая дорогая
            операция
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

              <small>
                {largestExpense.date}
              </small>
            </div>
          </div>
        </section>
      )}

      {/* Самый дорогой день */}

      {largestDay && (
        <section className="card">
          <h2>
            Самый дорогой
            день
          </h2>

          <div className="largest-day">
            <strong>
              {largestDay.amount.toLocaleString(
                "ru-RU",
              )}{" "}
              ₽
            </strong>

            <span>
              {largestDay.date}
            </span>
          </div>
        </section>
      )}

      {/* Топ дней */}

      <section className="card">
        <h2>
          Расходы по дням
        </h2>

        {monthExpenses.length === 0 ? (
          <p className="empty">
            Данных пока нет.
          </p>
        ) : (
          <div
            style={{
              width: "100%",
              height: 300,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    `${Number(value).toLocaleString("ru-RU")} ₽`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString("ru-RU")} ₽`
                  }
                  labelFormatter={(day) =>
                    `День ${day}`
                  }
                />

                <Bar
                  dataKey="amount"
                  name="Расходы"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}

export default Statistics;