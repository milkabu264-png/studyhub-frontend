import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { finishFocusSession, startFocusSession } from "../../services/focusApi";
import { getErrorMessage } from "../../services/api";
import { FOCUS_MAX_SECONDS, FOCUS_MIN_SECONDS } from "../../types/focus";
import { FocusContext } from "./FocusContext";
import type { FocusPhase, FocusSummary } from "./FocusContext";
import {
  getFocusedMs,
  getRemainingMs,
  readPending,
  readTimer,
  writePending,
  writeTimer,
} from "./focusUtils";
import type { PendingFinish, RunningTimer } from "./focusUtils";
import { playChime, unlockSound } from "./sound";

// CONTROLLER фокуса (C в MVC), п. 1.3.
//
// Таймер живёт на уровне всего приложения (в AppLayout): можно уйти в блокнот —
// отсчёт продолжится, а когда время выйдет, прозвучит сигнал.

//как часто обновляем цифры на экране; сам отсчёт от этого не зависит
const TICK_MS = 250;

export default function FocusProvider({ children }: { children: ReactNode }) {
  const [timer, setTimer] = useState<RunningTimer | null>(() => readTimer());
  const [summary, setSummary] = useState<FocusSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  //защита от двойного завершения (тик и кнопка «Стоп» в одну и ту же секунду)
  const finishingRef = useRef(false);

  function saveTimer(next: RunningTimer | null) {
    setTimer(next);
    writeTimer(next);
  }

  //отправить завершение сессии; если сервер не ответил — отправим при следующем подключении
  async function sendFinish(item: PendingFinish): Promise<boolean> {
    try {
      await finishFocusSession(item.sessionId, {
        status: item.status,
        focusedSeconds: item.focusedSeconds,
      });
      return true;
    } catch {
      return false;
    }
  }

  async function finish(status: "completed" | "interrupted") {
    if (!timer || finishingRef.current) {
      return;
    }

    finishingRef.current = true;

    const focusedSeconds =
      status === "completed"
        ? timer.plannedSeconds
        : Math.floor(getFocusedMs(timer) / 1000);

    saveTimer(null);
    setSummary({ status, focusedSeconds, plannedSeconds: timer.plannedSeconds });

    if (status === "completed") {
      setSoundBlocked(!(await playChime()));
    }

    const item = { sessionId: timer.sessionId, status, focusedSeconds };

    if (!(await sendFinish(item))) {
      writePending([...readPending(), item]);
    }

    finishingRef.current = false;
  }

  //при запуске отправляем завершения, которые не дошли до сервера в прошлый раз
  useEffect(() => {
    const pending = readPending();

    if (pending.length === 0) {
      return;
    }

    void Promise.all(pending.map(sendFinish)).then((results) => {
      writePending(pending.filter((_, index) => !results[index]));
    });
  }, []);

  //пока таймер идёт — обновляем экран
  useEffect(() => {
    if (!timer || timer.pausedAt) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(interval);
  }, [timer]);

  const remainingMs = timer ? getRemainingMs(timer, now) : 0;

  //время вышло (в том числе пока вкладка была закрыта)
  useEffect(() => {
    if (timer && !timer.pausedAt && getRemainingMs(timer) <= 0) {
      void finish("completed");
    }
  });

  async function start(seconds: number): Promise<boolean> {
    if (timer) {
      setError("Сначала остановите текущий таймер");
      return false;
    }

    if (!Number.isFinite(seconds) || seconds < FOCUS_MIN_SECONDS || seconds > FOCUS_MAX_SECONDS) {
      setError("Укажите время от 1 минуты до 12 часов");
      return false;
    }

    //разрешаем звук сейчас, пока есть нажатие пользователя
    unlockSound();
    setError(null);
    setSummary(null);
    setSoundBlocked(false);

    try {
      const session = await startFocusSession({ plannedSeconds: seconds });

      saveTimer({
        sessionId: session.id,
        plannedSeconds: seconds,
        startedAt: Date.now(),
        pausedMs: 0,
        pausedAt: null,
      });
      setNow(Date.now());

      return true;
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось запустить таймер. Попробуйте позже"));
      return false;
    }
  }

  function pause() {
    if (timer && !timer.pausedAt) {
      saveTimer({ ...timer, pausedAt: Date.now() });
    }
  }

  //время паузы не входит во время фокуса
  function resume() {
    if (timer?.pausedAt) {
      const resumedAt = Date.now();
      saveTimer({ ...timer, pausedMs: timer.pausedMs + (resumedAt - timer.pausedAt), pausedAt: null });
      setNow(resumedAt);
    }
  }

  let phase: FocusPhase = "idle";

  if (timer) {
    phase = timer.pausedAt ? "paused" : "running";
  } else if (summary) {
    phase = "finished";
  }

  return (
    <FocusContext.Provider
      value={{
        phase,
        remainingMs,
        plannedSeconds: timer?.plannedSeconds ?? summary?.plannedSeconds ?? 0,
        summary,
        error,
        soundBlocked,
        start,
        pause,
        resume,
        stop: () => finish("interrupted"),
        dismissSummary: () => {
          setSummary(null);
          setSoundBlocked(false);
        },
        clearError: () => setError(null),
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}
