import { useState } from "react";
import Header from "./components/Header";
import Expenses from "./pages/Expenses";
import Statistics from "./pages/Statistics";
import History from "./pages/History";
import CarCalculator from "./pages/CarCalculator";
import "./App.css";

type Page =
  | "expenses"
  | "statistics"
  | "history"
  | "car";

function App() {
  const [activePage, setActivePage] =
    useState<Page>("expenses");

  function renderPage() {
    switch (activePage) {
      case "expenses":
        return <Expenses />;

      case "statistics":
        return <Statistics />;

      case "history":
        return <History />;

      case "car":
        return <CarCalculator />;

      default:
        return <Expenses />;
    }
  }

  return (
    <div className="app">
      <Header
        activePage={activePage}
        onPageChange={setActivePage}
      />

      {renderPage()}
    </div>
  );
}

export default App;