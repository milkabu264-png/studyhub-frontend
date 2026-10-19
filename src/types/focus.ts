export type FocusSessionStatus = | "active" | "completed" | "interrupted";

//сессия фокуса: идёт, завершена (время вышло) или прервана кнопкой «Стоп»

export interface FocusSession {
  id: number;

  //на сколько был поставлен таймер, в секундах
  plannedSeconds: number;

  //сколько длился фокус без учёта пауз, в секундах
  focusedSeconds: number;

  status: FocusSessionStatus;

  startedAt: string;
  endedAt: string | null;
}

export interface StartFocusRequest {
  plannedSeconds: number;
}

export interface FinishFocusRequest {
  status: Exclude<FocusSessionStatus, "active">;
  focusedSeconds: number;
}

export const FOCUS_MIN_SECONDS = 60;
export const FOCUS_MAX_SECONDS = 12 * 60 * 60;

//таймер — от 1 минуты до 12 часов
