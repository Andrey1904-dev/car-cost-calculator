import { useState } from "react";
import type { Category, Expense } from "../types/expense";
import {
  categories,
  categoryIcons,
} from "../types/expense";
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
  saveExpenses,
} from "../utils/storage";

function Expenses() {
  const today = getToday();
  const currentDate = new Date();

  const [expenses, setExpenses] = useState<Expense[]>(
    loadExpenses,
  );

  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState<Category>("Продукты");
  const [comment, setComment] = useState("");
  const [expenseDate, setExpenseDate] =
    useState(today);

  const [selectedYear, setSelectedYear] =
    useState(currentDate.getFullYear());

  const [selectedMonth, setSelectedMonth] =
    useState(currentDate.getMonth());

  const monthExpenses = getMonthExpenses(
    expenses,
    selectedYear,
    selectedMonth,
  );

  const todayExpenses = expenses.filter(
    (expense) => expense.date === today,
  );

  const monthTotal = getTotal(monthExpenses);
  const todayTotal = getTotal(todayExpenses);

  const categoryTotals = getCategoryTotals(
    monthExpenses,
    categories,
  );

  const averageDailyExpense =
    getAverageDailyExpense(monthExpenses);

  const largestExpense =
    getLargestExpense(monthExpenses);

  function addExpense() {
    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      amount: numericAmount,
      category,
      date: expenseDate,
      comment: comment.trim(),
    };

    const updatedExpenses = [
      ...expenses,
      newExpense,
    ];

    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);

    setAmount("");
    setComment("");

    const selectedDate = new Date(
      `${expenseDate}T00:00:00`,
    );

    setSelectedYear(
      selectedDate.getFullYear(),
    );

    setSelectedMonth(
      selectedDate.getMonth(),
    );
  }

  function deleteExpense(id: number) {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== id,
    );

    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
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
        Контролируйте ежедневные и ежемесячные расходы
      </p>

      <section className="summary">
        <div className="summary-card">
          <span>Сегодня</span>

          <strong>
            {todayTotal.toLocaleString("ru-RU")} ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>
            {monthNames[selectedMonth]}{" "}
            {selectedYear}
          </span>

          <strong>
            {monthTotal.toLocaleString("ru-RU")} ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>Средний расход</span>

          <strong>
            {Math.round(
              averageDailyExpense,
            ).toLocaleString("ru-RU")}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>Операций</span>

          <strong>
            {monthExpenses.length}
          </strong>
        </div>
      </section>

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

      <button
        className="current-month-button"
        onClick={goToCurrentMonth}
      >
        Текущий месяц
      </button>

      <section className="card">
        <h2>Добавить расход</h2>

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
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {categoryIcons[item]}{" "}
                {item}
              </option>
            ))}
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
          className="add-button"
          onClick={addExpense}
        >
          + Добавить расход
        </button>
      </section>

      <section className="statistics">
        <h2>
          Структура расходов
        </h2>

        {categoryTotals.length === 0 ? (
          <p className="empty">
            В этом месяце расходов пока нет.
          </p>
        ) : (
          <div className="category-list">
            {categoryTotals.map(
              (item) => (
                <div
                  className="category-row"
                  key={item.category}
                >
                  <div className="category-name">
                    <span>
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

                  <strong>
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
          <h2>Самый большой расход</h2>

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

        {monthExpenses.length === 0 ? (
          <p className="empty">
            В этом месяце расходов ещё нет.
          </p>
        ) : (
          <div className="expense-list">
            {monthExpenses
              .slice()
              .reverse()
              .map((expense) => (
                <div
                  className="expense"
                  key={expense.id}
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
                      {expense.category}
                    </strong>

                    <span>
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
              ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Expenses;