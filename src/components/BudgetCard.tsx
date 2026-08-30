import { useEffect, useState } from "react";
import {
  loadMonthlyBudget,
  saveMonthlyBudget,
} from "../utils/budget";

type BudgetCardProps = {
  year: number;
  month: number;
  spent: number;
};

function BudgetCard({
  year,
  month,
  spent,
}: BudgetCardProps) {
  const [budget, setBudget] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBudget() {
      const data = await loadMonthlyBudget(
        year,
        month + 1,
      );

      const amount = data?.amount ?? 0;

      setBudget(amount);
      setInputValue(
        amount > 0 ? String(amount) : "",
      );
    }

    loadBudget();
  }, [year, month]);

  async function saveBudget() {
    const amount = Number(
      inputValue.replace(/\s/g, "").replace(",", "."),
    );

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      alert("Введите корректный бюджет.");
      return;
    }

    setSaving(true);

    const result = await saveMonthlyBudget(
      year,
      month + 1,
      amount,
    );

    setSaving(false);

    if (!result) {
      alert("Не удалось сохранить бюджет.");
      return;
    }

    setBudget(amount);
    setEditing(false);
  }

  const remaining = budget - spent;

  const progress =
    budget > 0
      ? Math.min((spent / budget) * 100, 100)
      : 0;

  const exceeded = budget > 0 && spent > budget;

  return (
    <section className="card budget-card">
      <div className="budget-header">
        <div>
          <h2>💰 Бюджет месяца</h2>

          {budget > 0 ? (
            <p className="budget-subtitle">
              {spent.toLocaleString("ru-RU")} ₽ из{" "}
              {budget.toLocaleString("ru-RU")} ₽
            </p>
          ) : (
            <p className="budget-subtitle">
              Бюджет ещё не установлен
            </p>
          )}
        </div>

        <button
          type="button"
          className="budget-edit-button"
          onClick={() =>
            setEditing(!editing)
          }
        >
          {editing ? "Отмена" : "Изменить"}
        </button>
      </div>

      {editing ? (
        <div className="budget-form">
          <label>
            Бюджет на месяц
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="100000"
              value={inputValue}
              onChange={(event) =>
                setInputValue(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="button"
            className="add-button"
            onClick={saveBudget}
            disabled={saving}
          >
            {saving
              ? "Сохраняем..."
              : "Сохранить бюджет"}
          </button>
        </div>
      ) : (
        <>
          {budget > 0 && (
            <>
              <div className="budget-progress">
                <div
                  className="budget-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="budget-info">
                <div>
                  <span>
                    Потрачено
                  </span>
                  <strong>
                    {spent.toLocaleString(
                      "ru-RU",
                    )}{" "}
                    ₽
                  </strong>
                </div>

                <div>
                  <span>
                    {exceeded
                      ? "Превышение"
                      : "Осталось"}
                  </span>
                  <strong
                    className={
                      exceeded
                        ? "budget-danger"
                        : ""
                    }
                  >
                    {Math.abs(
                      remaining,
                    ).toLocaleString(
                      "ru-RU",
                    )}{" "}
                    ₽
                  </strong>
                </div>
              </div>

              <p
                className={
                  exceeded
                    ? "budget-warning"
                    : "budget-status"
                }
              >
                {exceeded
                  ? "🔴 Бюджет превышен"
                  : progress >= 80
                    ? "🟠 Бюджет почти исчерпан"
                    : "🟢 Всё под контролем"}
              </p>
            </>
          )}

          {budget === 0 && (
            <button
              type="button"
              className="add-button"
              onClick={() =>
                setEditing(true)
              }
            >
              Установить бюджет
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default BudgetCard;
