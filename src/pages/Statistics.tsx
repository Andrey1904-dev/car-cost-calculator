import { useMemo, useState } from "react";
import {
  categories,
  categoryIcons,
} from "../types/expense";
import {
  getAverageDailyExpense,
  getCategoryTotals,
  getLargestExpense,
  getMonthExpenses,
  getTotal,
} from "../utils/calculations";
import { loadExpenses } from "../utils/storage";
import { monthNames } from "../utils/dates";

function Statistics() {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear(),
  );

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth(),
  );

  const expenses = loadExpenses();

  const monthExpenses = useMemo(
    () =>
      getMonthExpenses(
        expenses,
        selectedYear,
        selectedMonth,
      ),
    [expenses, selectedYear, selectedMonth],
  );

  const previousDate = new Date(
    selectedYear,
    selectedMonth - 1,
    1,
  );

  const previousMonthExpenses = getMonthExpenses(
    expenses,
    previousDate.getFullYear(),
    previousDate.getMonth(),
  );

  const total = getTotal(monthExpenses);

  const previousTotal = getTotal(
    previousMonthExpenses,
  );

  const averageDaily =
    getAverageDailyExpense(monthExpenses);

  const categoryTotals = getCategoryTotals(
    monthExpenses,
    categories,
  );

  const largestExpense =
    getLargestExpense(monthExpenses);

  const uniqueDays = new Set(
    monthExpenses.map(
      (expense) => expense.date,
    ),
  ).size;

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    monthExpenses.forEach((expense) => {
      totals[expense.date] =
        (totals[expense.date] || 0) +
        expense.amount;
    });

    return Object.entries(totals)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses]);

  const largestDay = dailyTotals[0];

  let monthDifference = 0;

  if (previousTotal > 0) {
    monthDifference =
      ((total - previousTotal) /
        previousTotal) *
      100;
  }

  function changeMonth(direction: number) {
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

  return (
    <main className="container">
      <h1>Статистика</h1>

      <p className="subtitle">
        Подробный анализ ваших расходов
      </p>

      <section className="month-selector">
        <button
          onClick={() => changeMonth(-1)}
        >
          ←
        </button>

        <div>
          <strong>
            {monthNames[selectedMonth]}{" "}
            {selectedYear}
          </strong>

          <span>
            {monthExpenses.length} операций
          </span>
        </div>

        <button
          onClick={() => changeMonth(1)}
        >
          →
        </button>
      </section>

      <section className="summary">
        <div className="summary-card">
          <span>Всего за месяц</span>

          <strong>
            {total.toLocaleString("ru-RU")} ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Средний расход в день
          </span>

          <strong>
            {Math.round(
              averageDaily,
            ).toLocaleString("ru-RU")}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Дней с расходами
          </span>

          <strong>{uniqueDays}</strong>
        </div>

        <div className="summary-card">
          <span>Операций</span>

          <strong>
            {monthExpenses.length}
          </strong>
        </div>
      </section>

      <section className="card">
        <h2>
          Сравнение с прошлым месяцем
        </h2>

        <div className="comparison">
          <strong>
            {monthDifference === 0
              ? "Нет данных"
              : `${Math.abs(
                  Math.round(
                    monthDifference,
                  ),
                )}%`}
          </strong>

          <span>
            {monthDifference > 0
              ? "Расходы выросли"
              : monthDifference < 0
                ? "Расходы снизились"
                : "Сравнить пока невозможно"}
          </span>
        </div>

        <div className="comparison-values">
          <div>
            <span>
              {monthNames[
                selectedMonth
              ]}
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
              {monthNames[
                previousDate.getMonth()
              ]}
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

      {/* =========================
          РАСХОДЫ ПО КАТЕГОРИЯМ
      ========================= */}

      <section className="card">
        <h2>
          Расходы по категориям
        </h2>

        {categoryTotals.length === 0 ? (
          <p className="empty">
            За этот месяц расходов нет.
          </p>
        ) : (
          <div className="expense-structure">
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
                    className="expense-structure-item"
                    key={item.category}
                  >
                    <div className="expense-structure-top">
                      <div className="expense-structure-name">
                        <span className="expense-structure-icon">
                          {
                            categoryIcons[
                              item.category
                            ]
                          }
                        </span>

                        <strong>
                          {item.category}
                        </strong>
                      </div>

                      <strong className="expense-structure-amount">
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
                      % от всех расходов
                    </span>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* =========================
          САМАЯ ДОРОГАЯ ОПЕРАЦИЯ
      ========================= */}

      {largestExpense && (
        <section className="card">
          <h2>
            Самая дорогая операция
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
                {largestExpense.category}
              </p>

              <small>
                {largestExpense.date}
              </small>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          САМЫЙ ДОРОГОЙ ДЕНЬ
      ========================= */}

      {largestDay && (
        <section className="card">
          <h2>
            Самый дорогой день
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

      {/* =========================
          САМЫЕ ДОРОГИЕ ДНИ
      ========================= */}

      <section className="card">
        <h2>
          Самые дорогие дни
        </h2>

        {dailyTotals.length === 0 ? (
          <p className="empty">
            Данных пока нет.
          </p>
        ) : (
          <div className="daily-list">
            {dailyTotals
              .slice(0, 7)
              .map((day) => (
                <div
                  className="daily-row"
                  key={day.date}
                >
                  <span>
                    {day.date}
                  </span>

                  <strong>
                    {day.amount.toLocaleString(
                      "ru-RU",
                    )}{" "}
                    ₽
                  </strong>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Statistics;