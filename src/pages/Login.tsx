import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const {
      error: loginError,
    } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      },
    );

    setLoading(false);

    if (loginError) {
      setError(
        "Неверный логин или пароль.",
      );
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-icon">
          🐰
        </div>

        <h1>Зайцы</h1>

        <p className="login-subtitle">
          Войдите, чтобы продолжить
        </p>

        <form onSubmit={handleLogin}>
          <label>
            Логин

            <input
              type="email"
              placeholder="Введите логин"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              autoComplete="email"
              required
            />
          </label>

          <label>
            Пароль

            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Входим..."
              : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;