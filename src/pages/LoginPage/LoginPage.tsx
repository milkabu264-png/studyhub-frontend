import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../features/auth/useAuth";
import {
  normalizePhone,
  validateEmail,
  validatePhone,
} from "../../features/auth/authValidation";
import { USE_MOCKS, getErrorMessage } from "../../services/api";
import { DEMO_USER } from "../../mocks/mockServer";
import AuthLogo from "./AuthLogo";

import type { LoginMethod } from "../../types/auth";

import "./AuthPage.css";

// Страница входа (п. 1.1.2): по e-mail или по номеру телефона.

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [method, setMethod] = useState<LoginMethod>("email");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  //куда вернуть после входа — на страницу, с которой перебросило на вход
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!loginValue.trim() || !password) {
      setError("Заполните все поля");
      return;
    }

    const loginError = method === "email" ? validateEmail(loginValue) : validatePhone(loginValue);
    setFieldError(loginError);

    if (loginError) {
      return;
    }

    setIsSending(true);

    try {
      await login({
        method,
        login: method === "email" ? loginValue.trim() : normalizePhone(loginValue),
        password,
      });

      navigate(from, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось войти. Попробуйте позже"));
    } finally {
      setIsSending(false);
    }
  }

  function switchMethod(next: LoginMethod) {
    setMethod(next);
    setLoginValue("");
    setFieldError(null);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthLogo />

        <h1>Вход</h1>
        <p className="auth-subtitle">Ваш костёр ждёт.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-switch" role="radiogroup" aria-label="Способ входа">
            <label>
              <input
                type="radio"
                name="loginType"
                value="email"
                checked={method === "email"}
                onChange={() => switchMethod("email")}
              />
              E-mail
            </label>

            <label>
              <input
                type="radio"
                name="loginType"
                value="phone"
                checked={method === "phone"}
                onChange={() => switchMethod("phone")}
              />
              Телефон
            </label>
          </div>

          <label className="auth-field">
            {method === "email" ? "E-mail" : "Телефон"}

            <input
              id="login"
              type={method === "email" ? "email" : "tel"}
              autoComplete={method === "email" ? "email" : "tel"}
              placeholder={method === "email" ? "anya@example.com" : "+79991234567"}
              value={loginValue}
              className={fieldError ? "auth-input-error" : ""}
              onChange={(event) => {
                setLoginValue(event.target.value);
                setFieldError(null);
              }}
            />

            {fieldError && <span className="auth-field-error">{fieldError}</span>}
          </label>

          <label className="auth-field">
            Пароль

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isSending}>
            {isSending ? "Входим…" : "Войти"}
          </button>
        </form>

        {USE_MOCKS && (
          <p className="auth-demo">
            Демо-аккаунт: {DEMO_USER.email} / {DEMO_USER.password}.{" "}
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setLoginValue(DEMO_USER.email);
                setPassword(DEMO_USER.password);
                setFieldError(null);
              }}
            >
              Подставить
            </button>
          </p>
        )}

        <p className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
