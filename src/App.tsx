import { useEffect, useState } from "react";

import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { supabase } from "./lib/supabaseClient";

import Expenses from "./pages/Expenses";
import History from "./pages/History";
import Statistics from "./pages/Statistics";
import Login from "./pages/Login";

import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <main className="container">
        <p className="empty">Загружаем приложение...</p>
      </main>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <NavLink to="/expenses" className="logo">
              <span className="logo-icon">🐰</span>
              <span className="logo-text">Зайцы</span>
            </NavLink>

            <nav className="navigation">
              <NavLink
                to="/expenses"
                className={({ isActive }) =>
                  isActive ? "nav-button active" : "nav-button"
                }
              >
                <span className="nav-icon">💸</span>
                <span className="nav-label">Расходы</span>
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive ? "nav-button active" : "nav-button"
                }
              >
                <span className="nav-icon">🕘</span>
                <span className="nav-label">История</span>
              </NavLink>

              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  isActive ? "nav-button active" : "nav-button"
                }
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">Статистика</span>
              </NavLink>
            </nav>

            <div className="header-account">
              <span className="header-email">
                {session.user.email}
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={logout}
              >
                Выйти
              </button>
            </div>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/expenses" replace />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/statistics"
            element={<Statistics />}
          />

          <Route
            path="*"
            element={<Navigate to="/expenses" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;