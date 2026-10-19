import { useState, type FormEvent } from "react";

import type { UpdateAccountRequest, User } from "../../types/auth";
import { NAME_MAX_LENGTH } from "../../types/auth";
import {
  collectErrors,
  normalizePhone,
  validateEmail,
  validateName,
  validatePhone,
} from "../auth/authValidation";

import "./settings.css";

interface ProfileFormProps {
  user: User;
  //возвращает текст ошибки сервера или null, если всё сохранилось
  onSave: (data: UpdateAccountRequest) => Promise<string | null>;
}

type Field = "name" | "email" | "phone" | "currentPassword";

//раздел «Аккаунт» (п. 1.1.4): имя, e-mail и телефон.
//Для смены e-mail или телефона нужен текущий пароль.

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState("");

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const contactChanged = email.trim() !== user.email || normalizePhone(phone) !== user.phone;

  //кнопка активна, только если что-то поменяли
  const isChanged = name.trim() !== user.name || contactChanged;

  function clearField(field: Field) {
    setErrors({ ...errors, [field]: undefined });
    setServerError(null);
    setIsSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = collectErrors<Field>({
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      currentPassword: contactChanged && !currentPassword ? "Введите текущий пароль" : null,
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    const error = await onSave({
      name: name.trim(),
      email: email.trim(),
      phone: normalizePhone(phone),
      currentPassword: contactChanged ? currentPassword : null,
    });

    setIsSaving(false);

    if (error) {
      setServerError(error);
      return;
    }

    //показываем значения так, как их сохранил сервер (телефон — в формате +7XXXXXXXXXX)
    setName(name.trim());
    setEmail(email.trim());
    setPhone(normalizePhone(phone));
    setCurrentPassword("");
    setIsSaved(true);
  }

  return (
    <form className="settings-section" onSubmit={handleSubmit} noValidate>
      <h2>Аккаунт</h2>

      <label className="settings-field">
        Имя

        <input
          id="userName"
          type="text"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
          value={name}
          className={errors.name ? "settings-input-error" : ""}
          onChange={(event) => {
            setName(event.target.value);
            clearField("name");
          }}
        />

        {errors.name && <span className="settings-error-text">{errors.name}</span>}
      </label>

      <div className="settings-row">
        <label className="settings-field">
          E-mail

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            className={errors.email ? "settings-input-error" : ""}
            onChange={(event) => {
              setEmail(event.target.value);
              clearField("email");
            }}
          />

          {errors.email && <span className="settings-error-text">{errors.email}</span>}
        </label>

        <label className="settings-field">
          Телефон

          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+7XXXXXXXXXX"
            value={phone}
            className={errors.phone ? "settings-input-error" : ""}
            onChange={(event) => {
              setPhone(event.target.value);
              clearField("phone");
            }}
          />

          {errors.phone && <span className="settings-error-text">{errors.phone}</span>}
        </label>
      </div>

      {/* текущий пароль — только когда меняется e-mail или телефон */}
      {contactChanged && (
        <label className="settings-field">
          Текущий пароль

          <input
            id="profilePassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            className={errors.currentPassword ? "settings-input-error" : ""}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              clearField("currentPassword");
            }}
          />

          {errors.currentPassword ? (
            <span className="settings-error-text">{errors.currentPassword}</span>
          ) : (
            <span className="settings-field-hint">Нужен, чтобы сменить e-mail или телефон</span>
          )}
        </label>
      )}

      {serverError && <p className="settings-server-error" role="alert">{serverError}</p>}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-button"
          disabled={!isChanged || isSaving}
        >
          {isSaving ? "Сохраняем…" : "Сохранить"}
        </button>

        {isSaved && !isChanged && <span className="settings-saved">Изменения сохранены</span>}
      </div>
    </form>
  );
}
