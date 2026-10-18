import { useState, type FormEvent } from "react";

import type { CampfireThresholds } from "../../types/settings";
import { DEFAULT_CAMPFIRE_THRESHOLDS } from "../../types/settings";
import { CAMPFIRE_LABELS } from "../campfire/campfireUtils";
import { plural } from "../tasks/taskUtils";
import { hasErrors, validateThresholds } from "./settingsUtils";
import type { ThresholdErrors } from "./settingsUtils";

import "./settings.css";
import "./CampfireSettingsForm.css";

interface CampfireSettingsFormProps {
  thresholds: CampfireThresholds;
  onSave: (thresholds: CampfireThresholds) => Promise<boolean>;
}

//поля формы — те же, что были в разделе «Настройки костра»
const FIELDS: { key: keyof CampfireThresholds; id: string; label: string }[] = [
  { key: "low", id: "lowFire", label: "Горит слабо" },
  { key: "burning", id: "normalFire", label: "Горит" },
  { key: "blazing", id: "blazingFire", label: "Пылает" },
];

//«1 задача», «3 задачи», «5 задач»
function tasksText(count: number): string {
  return `${count} ${plural(count, ["задача", "задачи", "задач"])}`;
}

//раздел «Настройки костра»: сколько задач в день нужно для каждого уровня огня

export default function CampfireSettingsForm({
  thresholds,
  onSave,
}: CampfireSettingsFormProps) {
  //в полях храним строки, чтобы поле можно было временно очистить
  const [values, setValues] = useState({
    low: String(thresholds.low),
    burning: String(thresholds.burning),
    blazing: String(thresholds.blazing),
  });

  const [errors, setErrors] = useState<ThresholdErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const current: CampfireThresholds = {
    low: Number(values.low),
    burning: Number(values.burning),
    blazing: Number(values.blazing),
  };

  const isChanged =
    current.low !== thresholds.low ||
    current.burning !== thresholds.burning ||
    current.blazing !== thresholds.blazing;

  //превью показываем, только когда числа корректные
  const isPreviewValid = !hasErrors(validateThresholds(current));

  function setField(key: keyof CampfireThresholds, value: string) {
    setValues({ ...values, [key]: value });
    setErrors({ ...errors, [key]: undefined });
    setIsSaved(false);
  }

  function handleReset() {
    setValues({
      low: String(DEFAULT_CAMPFIRE_THRESHOLDS.low),
      burning: String(DEFAULT_CAMPFIRE_THRESHOLDS.burning),
      blazing: String(DEFAULT_CAMPFIRE_THRESHOLDS.blazing),
    });
    setErrors({});
    setIsSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = validateThresholds(current);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      return;
    }

    setIsSaving(true);
    const ok = await onSave(current);
    setIsSaving(false);
    setIsSaved(ok);
  }

  return (
    <form className="settings-section" onSubmit={handleSubmit} noValidate>
      <h2>Настройки костра</h2>
      <p className="settings-section-hint">
        Сколько задач нужно сжечь за день, чтобы огонь разгорелся сильнее.
      </p>

      <div className="campfire-settings-fields">
        {FIELDS.map((field) => (
          <label key={field.key} className="settings-field">
            {field.label}

            <input
              id={field.id}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={values[field.key]}
              className={errors[field.key] ? "settings-input-error" : ""}
              onChange={(event) => setField(field.key, event.target.value)}
            />

            {errors[field.key] ? (
              <span className="settings-error-text">{errors[field.key]}</span>
            ) : (
              <span className="campfire-settings-unit">
                {tasksText(Number(values[field.key]) || 0)} в день
              </span>
            )}
          </label>
        ))}
      </div>

      {/* как будет выглядеть шкала с этими числами */}
      {isPreviewValid && (
        <ol className="campfire-levels" aria-label="Уровни костра">
          <li>
            <span className="campfire-level-range">0</span>
            {CAMPFIRE_LABELS.embers}
          </li>
          <li>
            <span className="campfire-level-range">
              {current.low === current.burning - 1 ? current.low : `${current.low}–${current.burning - 1}`}
            </span>
            {CAMPFIRE_LABELS.low}
          </li>
          <li>
            <span className="campfire-level-range">
              {current.burning === current.blazing - 1 ? current.burning : `${current.burning}–${current.blazing - 1}`}
            </span>
            {CAMPFIRE_LABELS.burning}
          </li>
          <li>
            <span className="campfire-level-range">{current.blazing}+</span>
            {CAMPFIRE_LABELS.blazing}
          </li>
        </ol>
      )}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-button"
          disabled={!isChanged || isSaving}
        >
          {isSaving ? "Сохраняем…" : "Сохранить"}
        </button>

        <button
          type="button"
          className="settings-button settings-button-secondary"
          onClick={handleReset}
        >
          Сбросить по умолчанию
        </button>

        {isSaved && !isChanged && <span className="settings-saved">Сохранено</span>}
      </div>
    </form>
  );
}
