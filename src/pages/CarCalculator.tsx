import { useMemo, useState } from "react";

function CarCalculator() {
  const [carName, setCarName] = useState("");

  const [carPrice, setCarPrice] = useState("");
  const [depreciation, setDepreciation] =
    useState("");

  const [fuelPrice, setFuelPrice] = useState("");
  const [consumption, setConsumption] =
    useState("");
  const [monthlyMileage, setMonthlyMileage] =
    useState("");

  const [insurance, setInsurance] =
    useState("");
  const [tax, setTax] = useState("");
  const [maintenance, setMaintenance] =
    useState("");
  const [carWash, setCarWash] = useState("");
  const [other, setOther] = useState("");

  const values = useMemo(() => {
    const price = Number(carPrice) || 0;
    const depreciationPercent =
      Number(depreciation) || 0;

    const fuel =
      (Number(monthlyMileage) / 100) *
      Number(consumption) *
      Number(fuelPrice);

    const monthlyInsurance =
      (Number(insurance) || 0) / 12;

    const monthlyTax =
      (Number(tax) || 0) / 12;

    const monthlyDepreciation =
      (price * depreciationPercent) /
      100 /
      12;

    const monthlyMaintenance =
      Number(maintenance) || 0;

    const monthlyWash =
      Number(carWash) || 0;

    const monthlyOther =
      Number(other) || 0;

    const monthlyTotal =
      fuel +
      monthlyInsurance +
      monthlyTax +
      monthlyDepreciation +
      monthlyMaintenance +
      monthlyWash +
      monthlyOther;

    const yearlyTotal =
      monthlyTotal * 12;

    const mileage =
      Number(monthlyMileage) || 0;

    const costPerKm =
      mileage > 0
        ? monthlyTotal / mileage
        : 0;

    return {
      fuel,
      monthlyInsurance,
      monthlyTax,
      monthlyDepreciation,
      monthlyMaintenance,
      monthlyWash,
      monthlyOther,
      monthlyTotal,
      yearlyTotal,
      costPerKm,
    };
  }, [
    carPrice,
    depreciation,
    fuelPrice,
    consumption,
    monthlyMileage,
    insurance,
    tax,
    maintenance,
    carWash,
    other,
  ]);

  const expenses = [
    {
      name: "Топливо",
      amount: values.fuel,
      icon: "⛽",
    },
    {
      name: "Страховка",
      amount: values.monthlyInsurance,
      icon: "🛡️",
    },
    {
      name: "Транспортный налог",
      amount: values.monthlyTax,
      icon: "📄",
    },
    {
      name: "Обслуживание",
      amount: values.monthlyMaintenance,
      icon: "🔧",
    },
    {
      name: "Мойка",
      amount: values.monthlyWash,
      icon: "🧽",
    },
    {
      name: "Другие расходы",
      amount: values.monthlyOther,
      icon: "📦",
    },
    {
      name: "Амортизация",
      amount: values.monthlyDepreciation,
      icon: "📉",
    },
  ];

  return (
    <main className="container">
      <h1>Автомобиль</h1>

      <p className="subtitle">
        Рассчитайте реальную стоимость содержания автомобиля
      </p>

      <section className="card">
        <h2>Информация об автомобиле</h2>

        <label>
          Марка и модель

          <input
            type="text"
            placeholder="BMW 3 Series"
            value={carName}
            onChange={(event) =>
              setCarName(event.target.value)
            }
          />
        </label>

        <label>
          Цена автомобиля

          <input
            type="number"
            min="0"
            placeholder="2000000"
            value={carPrice}
            onChange={(event) =>
              setCarPrice(event.target.value)
            }
          />
        </label>

        <label>
          Амортизация в год (%)

          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="10"
            value={depreciation}
            onChange={(event) =>
              setDepreciation(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Цена топлива за литр

          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="65"
            value={fuelPrice}
            onChange={(event) =>
              setFuelPrice(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Расход топлива (л / 100 км)

          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="8"
            value={consumption}
            onChange={(event) =>
              setConsumption(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Ежемесячный пробег (км)

          <input
            type="number"
            min="0"
            placeholder="1500"
            value={monthlyMileage}
            onChange={(event) =>
              setMonthlyMileage(
                event.target.value,
              )
            }
          />
        </label>
      </section>

      <section className="card">
        <h2>Дополнительные расходы</h2>

        <label>
          Страховка в год

          <input
            type="number"
            min="0"
            placeholder="30000"
            value={insurance}
            onChange={(event) =>
              setInsurance(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Транспортный налог в год

          <input
            type="number"
            min="0"
            placeholder="5000"
            value={tax}
            onChange={(event) =>
              setTax(event.target.value)
            }
          />
        </label>

        <label>
          Обслуживание в месяц

          <input
            type="number"
            min="0"
            placeholder="10000"
            value={maintenance}
            onChange={(event) =>
              setMaintenance(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Мойка в месяц

          <input
            type="number"
            min="0"
            placeholder="2000"
            value={carWash}
            onChange={(event) =>
              setCarWash(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Другие расходы в месяц

          <input
            type="number"
            min="0"
            placeholder="5000"
            value={other}
            onChange={(event) =>
              setOther(event.target.value)
            }
          />
        </label>
      </section>

      <section className="summary">
        <div className="summary-card">
          <span>Расходы в месяц</span>

          <strong>
            {Math.round(
              values.monthlyTotal,
            ).toLocaleString("ru-RU")}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>Расходы в год</span>

          <strong>
            {Math.round(
              values.yearlyTotal,
            ).toLocaleString("ru-RU")}{" "}
            ₽
          </strong>
        </div>

        <div className="summary-card">
          <span>Стоимость 1 км</span>

          <strong>
            {values.costPerKm.toFixed(2)} ₽
          </strong>
        </div>
      </section>

      {carName && (
        <section className="card">
          <h2>
            {carName}
          </h2>

          <p className="subtitle">
            Полная стоимость содержания
          </p>
        </section>
      )}

      <section className="card">
        <h2>Структура расходов</h2>

        <div className="statistics-list">
          {expenses.map((expense) => {
            const percentage =
              values.monthlyTotal > 0
                ? (expense.amount /
                    values.monthlyTotal) *
                  100
                : 0;

            return (
              <div
                className="statistic-item"
                key={expense.name}
              >
                <div className="statistic-header">
                  <div>
                    <span>
                      {expense.icon}
                    </span>

                    <strong>
                      {expense.name}
                    </strong>
                  </div>

                  <strong>
                    {Math.round(
                      expense.amount,
                    ).toLocaleString(
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
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default CarCalculator;