import { createContext } from "react";

//idle — таймер не запущен; running — идёт; paused — на паузе; finished — показываем итог
export type FocusPhase = | "idle" | "running" | "paused" | "finished";

export interface FocusSummary {
  status: "completed" | "interrupted";
  focusedSeconds: number;
  plannedSeconds: number;
}

export interface FocusController {
  phase: FocusPhase;
  remainingMs: number;
  plannedSeconds: number;
  summary: FocusSummary | null;
  error: string | null;
  //звук окончания заблокирован браузером — показываем подсказку
  soundBlocked: boolean;

  start: (seconds: number) => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  dismissSummary: () => void;
  clearError: () => void;
}

export const FocusContext = createContext<FocusController | null>(null);
