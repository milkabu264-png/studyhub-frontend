import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../features/auth/useAuth";
import {
  collectErrors,
  normalizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "../../features/auth/authValidation";
import { getErrorMessage } from "../../services/api";
import AuthLogo from "../LoginPage/AuthLogo";
import { NAME_MAX_LENGTH } from "../../types/auth";

import "../LoginPage/AuthPage.css";

// Страница регистрации (п. 1.1.1): имя, e-mail и телефон (оба обязательны), пароль дважды.

type Field = "name" | "email" | "phone" | "password" | "repeatPassword";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  function setField(field: Field, value: string) {
    setValues({ ...values, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (Object.values(values).some((value) => !value.trim())) {
      setError("Заполните все поля");
      return;
    }

    const newErrors = collectErrors<Field>({
      name: validateName(values.name),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      password: validatePassword(values.password),
      repeatPassword: values.password !== values.repeatPassword ? "Пароли не совпадают" : null,
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSending(true);

    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: normalizePhone(values.phone),
        password: values.password,
      });

      //после регистрации сразу входим и попадаем на главную
      navigate("/", { replace: true });
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось создать аккаунт. Попробуйте позже"));
    } finally {
      setIsSending(false);
    }
  }

  function renderField(
    field: Field,
    label: string,
    type: string,
    autoComplete: string,
    placeholder: string,
    hint?: string,
  ) {
    return (
      <label className="auth-field">
        {label}

        <input
          id={field}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={field === "name" ? NAME_MAX_LENGTH : undefined}
          value={values[field]}
          className={errors[field] ? "auth-input-error" : ""}
          onChange={(event) => setField(field, event.target.value)}
        />

        {errors[field] ? (
          <span className="auth-field-error">{errors[field]}</span>
        ) : (
          hint && <span className="auth-field-hint">{hint}</span>
        )}
      </label>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthLogo />

        <h1>Регистрация</h1>
        <p className="auth-subtitle">Новый костёр начинается с первой задачи.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {renderField("name", "Имя", "text", "name", "Введите имя")}
          {renderField("email", "E-mail", "email", "email", "anya@example.com")}
          {renderField("phone", "Телефон", "tel", "tel", "+79991234567", "В формате +7XXXXXXXXXX")}
          {renderField("password", "Пароль", "password", "new-password", "Придумайте пароль", "Минимум 8 символов, буквы и цифры")}
          {renderField("repeatPassword", "Повторите пароль", "password", "new-password", "Повторите пароль")}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isSending}>
            {isSending ? "Создаём…" : "Создать аккаунт"}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войдите</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
