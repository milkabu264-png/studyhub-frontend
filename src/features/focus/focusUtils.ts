// Таймер фокуса считается от времени старта, а не по тикам (п. 2.2):
// так он не сбивается, если вкладка свёрнута или браузер «уснул».

//что храним о запущенном таймере (в localStorage, чтобы пережить перезагрузку)
export interface RunningTimer {
  sessionId: number;
  plannedSeconds: number;
  //время старта, мс
  startedAt: number;
  //сколько всего длились закончившиеся паузы, мс
  pausedMs: number;
  //когда началась текущая пауза; null — таймер идёт
  pausedAt: number | null;
}

export const FOCUS_STORAGE_KEY = "studyhub-focus";

//сколько миллисекунд таймер реально отсчитал (без пауз)
export function getFocusedMs(timer: RunningTimer, now = Date.now()): number {
  const currentPause = timer.pausedAt ? now - timer.pausedAt : 0;
  return Math.max(0, now - timer.startedAt - timer.pausedMs - currentPause);
}

export function getRemainingMs(timer: RunningTimer, now = Date.now()): number {
  return Math.max(0, timer.plannedSeconds * 1000 - getFocusedMs(timer, now));
}

//18:42 или 1:05:00
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

//«1 ч 15 мин», «25 мин», «меньше минуты»
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (minutes === 0) return "меньше минуты";
  if (hours === 0) return `${minutes} мин`;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
}

export function readTimer(): RunningTimer | null {
  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as RunningTimer) : null;
  } catch {
    return null;
  }
}

export function writeTimer(timer: RunningTimer | null) {
  try {
    if (timer) {
      localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(timer));
    } else {
      localStorage.removeItem(FOCUS_STORAGE_KEY);
    }
  } catch {
    //хранилище недоступно — таймер просто не переживёт перезагрузку
  }
}

// ---------- завершения, которые не удалось отправить ----------

//если сервер не ответил на «сессия завершена», запоминаем и отправим при следующем подключении
export interface PendingFinish {
  sessionId: number;
  status: "completed" | "interrupted";
  focusedSeconds: number;
}

const PENDING_KEY = "studyhub-focus-pending";

export function readPending(): PendingFinish[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]") as PendingFinish[];
  } catch {
    return [];
  }
}

export function writePending(items: PendingFinish[]) {
  try {
    if (items.length > 0) {
      localStorage.setItem(PENDING_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(PENDING_KEY);
    }
  } catch {
    //некуда сохранить — ничего не поделать
  }
}
