import { useState, type FormEvent } from "react";

import useFocus from "./useFocus";
import useConfirm from "../../components/ConfirmDialog/useConfirm";
import { formatClock, formatDuration } from "./focusUtils";

import "./FocusPanel.css";

//быстрые варианты времени, в минутах
const PRESETS = [25, 50, 90];

function presetLabel(minutes: number): string {
  return minutes < 60 ? `${minutes} мин` : formatDuration(minutes * 60);
}

//окно фокус-таймера внутри карточки костра (п. 1.3)

export default function FocusPanel() {
  const focus = useFocus();
  const confirm = useConfirm();

  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [isStarting, setIsStarting] = useState(false);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const h = Number(hours || 0);
    const m = Number(minutes || 0);
    const seconds = Math.round(h * 3600 + m * 60);

    setIsStarting(true);
    await focus.start(Number.isInteger(h) && Number.isInteger(m) ? seconds : NaN);
    setIsStarting(false);
  }

  async function handleStop() {
    const ok = await confirm({
      title: "Остановить фокус?",
      text: "Сессия сохранится как прерванная, а время до остановки попадёт в статистику.",
      confirmText: "Остановить",
    });

    if (ok) {
      await focus.stop();
    }
  }

  // ---------- итог сессии ----------

  if (focus.phase === "finished" && focus.summary) {
    const isCompleted = focus.summary.status === "completed";

    return (
      <div className="focus-panel focus-panel-finished" role="status">
        <p className="focus-finished-title">{isCompleted ? "Время вышло" : "Фокус остановлен"}</p>

        <p className="focus-finished-text">
          Фокус длился {formatDuration(focus.summary.focusedSeconds)}
          {!isCompleted && ` из ${formatDuration(focus.summary.plannedSeconds)}`}.
        </p>

        {isCompleted && focus.soundBlocked && (
          <p className="focus-sound-hint">
            Сигнал не прозвучал: разрешите звук для этого сайта в настройках браузера.
          </p>
        )}

        <button type="button" className="focus-button focus-button-primary" onClick={focus.dismissSummary}>
          Готово
        </button>
      </div>
    );
  }

  // ---------- таймер идёт или на паузе ----------

  if (focus.phase === "running" || focus.phase === "paused") {
    const done = 1 - focus.remainingMs / (focus.plannedSeconds * 1000);

    return (
      <div className="focus-panel">
        <p className={focus.phase === "paused" ? "focus-clock focus-clock-paused" : "focus-clock"} aria-live="off">
          {formatClock(focus.remainingMs)}
        </p>

        <p className="focus-caption">
          {focus.phase === "paused" ? "На паузе · " : ""}таймер на {formatDuration(focus.plannedSeconds)}
        </p>

        <div className="focus-progress" aria-hidden="true">
          <div className="focus-progress-fill" style={{ width: `${Math.min(100, done * 100)}%` }} />
        </div>

        <div className="focus-actions">
          {focus.phase === "running" ? (
            <button type="button" className="focus-button" onClick={focus.pause}>
              Пауза
            </button>
          ) : (
            <button type="button" className="focus-button focus-button-primary" onClick={focus.resume}>
              Продолжить
            </button>
          )}

          <button type="button" className="focus-button" onClick={() => void handleStop()}>
            Стоп
          </button>
        </div>
      </div>
    );
  }

  // ---------- выбор времени ----------

  return (
    <form className="focus-panel" onSubmit={handleStart} noValidate>
      <p className="focus-question">На сколько сосредоточиться?</p>

      <div className="focus-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={
              Number(hours) * 60 + Number(minutes) === preset
                ? "focus-preset focus-preset-active"
                : "focus-preset"
            }
            onClick={() => {
              setHours(String(Math.floor(preset / 60)));
              setMinutes(String(preset % 60));
              focus.clearError();
            }}
          >
            {presetLabel(preset)}
          </button>
        ))}
      </div>

      <div className="focus-inputs">
        <label>
          <input
            id="focusHours"
            type="number"
            inputMode="numeric"
            min="0"
            max="12"
            value={hours}
            onChange={(event) => {
              setHours(event.target.value);
              focus.clearError();
            }}
          />
          ч
        </label>

        <label>
          <input
            id="focusMinutes"
            type="number"
            inputMode="numeric"
            min="0"
            max="59"
            value={minutes}
            onChange={(event) => {
              setMinutes(event.target.value);
              focus.clearError();
            }}
          />
          мин
        </label>
      </div>

      {focus.error && <p className="focus-error" role="alert">{focus.error}</p>}

      <button type="submit" className="focus-button focus-button-primary focus-start" disabled={isStarting}>
        {isStarting ? "Запускаем…" : "Старт"}
      </button>

      <p className="focus-note">От 1 минуты до 12 часов. Время фокуса попадёт в статистику.</p>
    </form>
  );
}
