import { useMemo, useState } from "react";
import {
  categories,
  categoryIcons,
} from "../types/expense";
import type { Category } from "../types/expense";
import {
  getTotal,
} from "../utils/calculations";
import {
  loadExpenses,
  saveExpenses,
} from "../utils/storage";
import {
  formatDate,
} from "../utils/dates";

function History() {
  const [expenses, setExpenses] =
    useState(loadExpenses());

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<Category | "Все">("Все");

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const matchesSearch =
          search.trim() === "" ||
          expense.category
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          expense.comment
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === "Все" ||
          expense.category === selectedCategory;

        const matchesMonth =
          selectedMonth === "" ||
          expense.date.startsWith(selectedMonth);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMonth
        );
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }

        return b.id - a.id;
      });
  }, [
    expenses,
    search,
    selectedCategory,
    selectedMonth,
  ]);

  const total = getTotal(filteredExpenses);

  function deleteExpense(id: number) {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== id,
    );

    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("Все");
    setSelectedMonth("");
  }

  return (
    <main className="container">
      <h1>История</h1>

      <p className="subtitle">
        Все ваши расходы в одном месте
      </p>

      <section className="summary">
        <div className="summary-card">
          <span>Найдено</span>

          <strong>
            {filteredExpenses.length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Сумма</span>

          <strong>
            {total.toLocaleString("ru-RU")} ₽
          </strong>
        </div>
      </section>

      <section className="card">
        <h2>Поиск и фильтры</h2>

        <label>
          Поиск

          <input
            type="text"
            placeholder="Категория или комментарий"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <label>
          Категория

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target
                  .value as Category | "Все",
              )
            }
          >
            <option value="Все">
              Все категории
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {categoryIcons[category]}{" "}
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Месяц

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value,
              )
            }
          />
        </label>

        <button
          className="current-month-button"
          onClick={clearFilters}
        >
          Сбросить фильтры
        </button>
      </section>

      <section className="expenses-section">
        <h2>
          Операции
        </h2>

        {filteredExpenses.length === 0 ? (
          <p className="empty">
            По выбранным параметрам расходов нет.
          </p>
        ) : (
          <div className="expense-list">
            {filteredExpenses.map(
              (expense) => (
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
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default History;