import { useState, type FormEvent } from "react";

import type { UserProfile } from "../../types/settings";
import {
  NAME_MAX_LENGTH,
  hasErrors,
  validateProfile,
} from "./settingsUtils";
import type { ProfileErrors } from "./settingsUtils";

import "./settings.css";

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => Promise<boolean>;
}

//раздел «Аккаунт»: имя и e-mail

export default function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  //кнопка активна, только если что-то поменяли
  const isChanged = name !== profile.name || email !== profile.email;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = { name: name.trim(), email: email.trim() };
    const newErrors = validateProfile(data);

    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      return;
    }

    setIsSaving(true);
    const ok = await onSave(data);
    setIsSaving(false);
    setIsSaved(ok);
  }

  return (
    <form className="settings-section" onSubmit={handleSubmit} noValidate>
      <h2>Аккаунт</h2>

      <label className="settings-field">
        Имя

        <input
          id="userName"
          type="text"
          maxLength={NAME_MAX_LENGTH}
          value={name}
          className={errors.name ? "settings-input-error" : ""}
          onChange={(event) => {
            setName(event.target.value);
            setIsSaved(false);
            setErrors({ ...errors, name: undefined });
          }}
        />

        {errors.name && <span className="settings-error-text">{errors.name}</span>}
      </label>

      <label className="settings-field">
        E-mail

        <input
          id="email"
          type="email"
          value={email}
          className={errors.email ? "settings-input-error" : ""}
          onChange={(event) => {
            setEmail(event.target.value);
            setIsSaved(false);
            setErrors({ ...errors, email: undefined });
          }}
        />

        {errors.email && <span className="settings-error-text">{errors.email}</span>}
      </label>

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-button"
          disabled={!isChanged || isSaving}
        >
          {isSaving ? "Сохраняем…" : "Сохранить"}
        </button>

        {isSaved && !isChanged && <span className="settings-saved">Сохранено</span>}
      </div>
    </form>
  );
}
