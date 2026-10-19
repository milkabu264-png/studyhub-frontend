import { useEffect, useRef, useState } from "react";

import CampfireScene from "./CampfireScene";
import FocusPanel from "../focus/FocusPanel";
import useFocus from "../focus/useFocus";
import { formatClock } from "../focus/focusUtils";
import { registerFireZone } from "../tasks/logDrag";
import { CAMPFIRE_LABELS } from "./campfireUtils";
import { plural } from "../tasks/taskUtils";
import { MAX_LOGS } from "../../types/campfire";
import type { CampfireState } from "../../types/campfire";

import "./CampfireCard.css";

interface CampfireCardProps {
  logs: number;
  state: CampfireState;
  logsToNextState: number | null;
  minutesToNextBurn: number | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  //есть ли активные задачи, которые можно бросить в костёр
  hasActiveTasks: boolean;
  //сразу открыть фокус (например, пришли по ссылке из шапки)
  openFocus?: boolean;
}

const NEXT_STATE_NAMES: Partial<Record<CampfireState, string>> = {
  out: "«тлеет»",
  smoldering: "«горит»",
  burning: "«пылает»",
};

function logsText(count: number): string {
  return `${count} ${plural(count, ["бревно", "бревна", "брёвен"])}`;
}

//«У вашего костра» на главной (п. 1.6.1).
//Нажатие на костёр превращает карточку в окно фокус-таймера (п. 1.3).

export default function CampfireCard({
  logs,
  state,
  logsToNextState,
  minutesToNextBurn,
  isLoading,
  error,
  onRetry,
  hasActiveTasks,
  openFocus = false,
}: CampfireCardProps) {
  const focus = useFocus();

  //fire — костёр, focus — окно таймера
  const [mode, setMode] = useState<"fire" | "focus">(
    openFocus || focus.phase !== "idle" ? "focus" : "fire",
  );

  //над костром держат задачу-бревно
  const [isHovered, setIsHovered] = useState(false);
  //короткая вспышка огня, когда в костёр упало бревно
  const [isFlaring, setIsFlaring] = useState(false);

  const cardRef = useRef<HTMLElement>(null);
  const previousLogs = useRef(logs);

  //вся карточка — место, куда можно бросить бревно
  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    return registerFireZone(cardRef.current, setIsHovered);
  }, []);

  //брёвен стало больше — огонь вспыхивает
  useEffect(() => {
    if (logs > previousLogs.current) {
      setIsFlaring(true);
      const timer = window.setTimeout(() => setIsFlaring(false), 900);
      previousLogs.current = logs;
      return () => window.clearTimeout(timer);
    }

    previousLogs.current = logs;
  }, [logs]);

  useEffect(() => {
    if (openFocus) {
      setMode("focus");
    }
  }, [openFocus]);

  const isFocusActive = focus.phase === "running" || focus.phase === "paused";

  return (
    <section
      ref={cardRef}
      id="campfire"
      className={[
        "campfire-section",
        isHovered ? "campfire-section-hovered" : "",
        mode === "focus" ? "campfire-section-focus" : "",
      ].join(" ")}
    >
      <div className="campfire-header">
        <h2>{mode === "focus" ? "Фокус" : "У вашего костра"}</h2>

        {mode === "focus" ? (
          <button type="button" className="campfire-mode-button" onClick={() => setMode("fire")}>
            ← К костру
          </button>
        ) : (
          <button type="button" className="campfire-mode-button" onClick={() => setMode("focus")}>
            Фокус →
          </button>
        )}
      </div>

      {/* нажатие на костёр открывает фокус-таймер */}
      {mode === "fire" ? (
        <button
          type="button"
          className="campfire-scene-button"
          aria-label="Открыть фокус-таймер"
          onClick={() => setMode("focus")}
        >
          <CampfireScene state={state} isFlaring={isFlaring} />
          <span className="campfire-scene-hint">Нажмите на костёр, чтобы сосредоточиться</span>
        </button>
      ) : (
        <CampfireScene state={state} isFlaring={isFlaring} isCompact />
      )}

      {mode === "focus" ? (
        <FocusPanel />
      ) : (
        <>
          {isFocusActive && (
            <button type="button" className="campfire-focus-chip" onClick={() => setMode("focus")}>
              {focus.phase === "paused" ? "Фокус на паузе" : "Идёт фокус"} · {formatClock(focus.remainingMs)}
            </button>
          )}

          {error ? (
            <div className="campfire-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={onRetry}>Повторить</button>
            </div>
          ) : (
            <div className="campfire-status" aria-busy={isLoading}>
              <p className="campfire-state">{CAMPFIRE_LABELS[state]}</p>

              {/* запас брёвен: сколько из 100 */}
              <div
                className="campfire-meter"
                role="meter"
                aria-label="Запас брёвен"
                aria-valuemin={0}
                aria-valuemax={MAX_LOGS}
                aria-valuenow={logs}
              >
                <div className="campfire-meter-fill" style={{ width: `${(logs / MAX_LOGS) * 100}%` }} />
              </div>

              <p className="campfire-info">
                <strong>{logs}</strong> из {MAX_LOGS} брёвен
                {logsToNextState !== null && NEXT_STATE_NAMES[state] && (
                  <> · до {NEXT_STATE_NAMES[state]} ещё {logsText(logsToNextState)}</>
                )}
              </p>

              {minutesToNextBurn !== null && (
                <p className="campfire-burn">
                  Костёр сгорает по бревну в час — следующее через {minutesToNextBurn} мин
                </p>
              )}
            </div>
          )}

          <div className={isHovered ? "campfire-drop campfire-drop-active" : "campfire-drop"}>
            {isHovered
              ? "Отпустите — бревно сгорит"
              : hasActiveTasks
                ? "Перетащите сюда задачу-бревно или отметьте её галочкой"
                : "Создайте задачу — она появится здесь бревном"}
          </div>
        </>
      )}
    </section>
  );
}
