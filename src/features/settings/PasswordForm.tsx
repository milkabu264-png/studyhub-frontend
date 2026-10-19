import { useState, type FormEvent } from "react";

import type { ChangePasswordRequest } from "../../types/auth";
import { collectErrors, validatePassword } from "../auth/authValidation";

import "./settings.css";

interface PasswordFormProps {
  //возвращает текст ошибки сервера или null, если всё сохранилось
  onSave: (data: ChangePasswordRequest) => Promise<string | null>;
}

type Field = "currentPassword" | "newPassword" | "repeatPassword";

//смена пароля (п. 1.1.4): текущий пароль, новый и повтор

export default function PasswordForm({ onSave }: PasswordFormProps) {
  const [values, setValues] = useState<Record<Field, string>>({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function setField(field: Field, value: string) {
    setValues({ ...values, [field]: value });
    setErrors({ ...errors, [field]: undefined });
    setServerError(null);
    setIsSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = collectErrors<Field>({
      currentPassword: values.currentPassword ? null : "Введите текущий пароль",
      newPassword: validatePassword(values.newPassword),
      repeatPassword: values.newPassword !== values.repeatPassword ? "Пароли не совпадают" : null,
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    const error = await onSave({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    setIsSaving(false);

    if (error) {
      setServerError(error);
      return;
    }

    setValues({ currentPassword: "", newPassword: "", repeatPassword: "" });
    setIsSaved(true);
  }

  const isFilled = Object.values(values).some(Boolean);

  function renderField(field: Field, label: string, autoComplete: string, hint?: string) {
    return (
      <label className="settings-field">
        {label}

        <input
          id={field}
          type="password"
          autoComplete={autoComplete}
          value={values[field]}
          className={errors[field] ? "settings-input-error" : ""}
          onChange={(event) => setField(field, event.target.value)}
        />

        {errors[field] ? (
          <span className="settings-error-text">{errors[field]}</span>
        ) : (
          hint && <span className="settings-field-hint">{hint}</span>
        )}
      </label>
    );
  }

  return (
    <form className="settings-section" onSubmit={handleSubmit} noValidate>
      <h2>Пароль</h2>

      {renderField("currentPassword", "Текущий пароль", "current-password")}

      <div className="settings-row">
        {renderField("newPassword", "Новый пароль", "new-password", "Минимум 8 символов, буквы и цифры")}
        {renderField("repeatPassword", "Повторите пароль", "new-password")}
      </div>

      {serverError && <p className="settings-server-error" role="alert">{serverError}</p>}

      <div className="settings-actions">
        <button type="submit" className="settings-button" disabled={!isFilled || isSaving}>
          {isSaving ? "Сохраняем…" : "Сменить пароль"}
        </button>

        {isSaved && <span className="settings-saved">Изменения сохранены</span>}
      </div>
    </form>
  );
}
