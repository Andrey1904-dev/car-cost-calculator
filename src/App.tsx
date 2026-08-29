import { useEffect, useState } from "react";

function App() {
  const [carName, setCarName] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [consumption, setConsumption] = useState("");
  const [monthlyMileage, setMonthlyMileage] = useState("");
  const [insurance, setInsurance] = useState("");
  const [tax, setTax] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [washing, setWashing] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [depreciation, setDepreciation] = useState("10");

  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("car-cost-calculator");

    if (savedData) {
      const data = JSON.parse(savedData);

      setCarName(data.carName ?? "");
      setCarPrice(data.carPrice ?? "");
      setFuelPrice(data.fuelPrice ?? "");
      setConsumption(data.consumption ?? "");
      setMonthlyMileage(data.monthlyMileage ?? "");
      setInsurance(data.insurance ?? "");
      setTax(data.tax ?? "");
      setMaintenance(data.maintenance ?? "");
      setWashing(data.washing ?? "");
      setOtherExpenses(data.otherExpenses ?? "");
      setDepreciation(data.depreciation ?? "10");
    }
  }, []);

  const calculate = () => {
    setCalculated(true);

    const data = {
      carName,
      carPrice,
      fuelPrice,
      consumption,
      monthlyMileage,
      insurance,
      tax,
      maintenance,
      washing,
      otherExpenses,
      depreciation,
    };

    localStorage.setItem(
      "car-cost-calculator",
      JSON.stringify(data)
    );
  };

  const clearAll = () => {
    setCarName("");
    setCarPrice("");
    setFuelPrice("");
    setConsumption("");
    setMonthlyMileage("");
    setInsurance("");
    setTax("");
    setMaintenance("");
    setWashing("");
    setOtherExpenses("");
    setDepreciation("10");
    setCalculated(false);

    localStorage.removeItem("car-cost-calculator");
  };

  const fuelCost =
    (Number(monthlyMileage) / 100) *
    Number(consumption) *
    Number(fuelPrice);

  const monthlyInsurance = Number(insurance) / 12;
  const monthlyTax = Number(tax) / 12;

  const yearlyDepreciation =
    (Number(carPrice) * Number(depreciation)) / 100;

  const monthlyDepreciation =
    yearlyDepreciation / 12;

  const monthlyMaintenance = Number(maintenance);
  const monthlyWashing = Number(washing);
  const monthlyOther = Number(otherExpenses);

  const monthlyTotal =
    fuelCost +
    monthlyInsurance +
    monthlyTax +
    monthlyMaintenance +
    monthlyWashing +
    monthlyOther +
    monthlyDepreciation;

  const yearlyTotal = monthlyTotal * 12;

  const costPerKm =
    Number(monthlyMileage) > 0
      ? monthlyTotal / Number(monthlyMileage)
      : 0;

  const formatMoney = (value: number) => {
    return value.toLocaleString("ru-RU", {
      maximumFractionDigits: 0,
    });
  };

  const expenses = [
    {
      name: "Топливо",
      value: fuelCost,
    },
    {
      name: "Страховка",
      value: monthlyInsurance,
    },
    {
      name: "Транспортный налог",
      value: monthlyTax,
    },
    {
      name: "Обслуживание",
      value: monthlyMaintenance,
    },
    {
      name: "Мойка",
      value: monthlyWashing,
    },
    {
      name: "Другие расходы",
      value: monthlyOther,
    },
    {
      name: "Амортизация",
      value: monthlyDepreciation,
    },
  ];

  return (
    <div className="app">
      <div className="container">

        <header className="header">
          <h1>Калькулятор затрат на автомобиль</h1>

          <p className="subtitle">
            Рассчитайте реальную стоимость содержания автомобиля
          </p>
        </header>

        <div className="card">
          <h2>Информация об автомобиле</h2>

          <label>
            Марка и модель
            <input
              type="text"
              placeholder="BMW 3 Series"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
            />
          </label>

          <label>
            Цена автомобиля
            <input
              type="number"
              placeholder="1 500 000"
              value={carPrice}
              onChange={(e) => setCarPrice(e.target.value)}
            />
          </label>

          <label>
            Амортизация в год (%)
            <input
              type="number"
              min="0"
              max="100"
              placeholder="10"
              value={depreciation}
              onChange={(e) => setDepreciation(e.target.value)}
            />
          </label>

          <label>
            Цена топлива за литр
            <input
              type="number"
              min="0"
              placeholder="65"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
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
              onChange={(e) => setConsumption(e.target.value)}
            />
          </label>

          <label>
            Ежемесячный пробег (км)
            <input
              type="number"
              min="0"
              placeholder="1500"
              value={monthlyMileage}
              onChange={(e) => setMonthlyMileage(e.target.value)}
            />
          </label>
        </div>

        <div className="card">
          <h2>Дополнительные расходы</h2>

          <label>
            Страховка в год
            <input
              type="number"
              min="0"
              placeholder="30 000"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </label>

          <label>
            Транспортный налог в год
            <input
              type="number"
              min="0"
              placeholder="8 000"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
            />
          </label>

          <label>
            Обслуживание в месяц
            <input
              type="number"
              min="0"
              placeholder="5 000"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
            />
          </label>

          <label>
            Мойка в месяц
            <input
              type="number"
              min="0"
              placeholder="2 000"
              value={washing}
              onChange={(e) => setWashing(e.target.value)}
            />
          </label>

          <label>
            Другие расходы в месяц
            <input
              type="number"
              min="0"
              placeholder="3 000"
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(e.target.value)}
            />
          </label>
        </div>

        <div className="actions">
          <button
            className="calculate-button"
            onClick={calculate}
          >
            Рассчитать стоимость
          </button>

          <button
            className="clear-button"
            onClick={clearAll}
          >
            Очистить
          </button>
        </div>

        {calculated && (
          <>
            <div className="results">
              <div className="result result-main">
                <div>
                  <span>Расходы в месяц</span>
                  <strong>
                    {formatMoney(monthlyTotal)} ₽
                  </strong>
                </div>

                {carName && (
                  <small>{carName}</small>
                )}
              </div>

              <div className="result-secondary">
                <div>
                  <span>Расходы в год</span>
                  <strong>
                    {formatMoney(yearlyTotal)} ₽
                  </strong>
                </div>

                <div>
                  <span>Стоимость 1 км</span>
                  <strong>
                    {costPerKm.toFixed(2)} ₽
                  </strong>
                </div>
              </div>
            </div>

            <div className="card breakdown">
              <h2>Структура расходов</h2>

              {expenses.map((expense) => {
                const percentage =
                  monthlyTotal > 0
                    ? (expense.value / monthlyTotal) * 100
                    : 0;

                return (
                  <div
                    className="breakdown-item"
                    key={expense.name}
                  >
                    <div className="breakdown-row">
                      <span>{expense.name}</span>

                      <strong>
                        {formatMoney(expense.value)} ₽
                      </strong>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default App;