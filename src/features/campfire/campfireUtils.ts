import type { Campfire, CampfireState } from "../../types/campfire";
import {
  BURN_LOGS_PER_HOUR,
  CAMPFIRE_THRESHOLDS,
  MAX_LOGS,
} from "../../types/campfire";

// Правила костра (п. 1.6) — чистые функции без React.
// Ими пользуется и экран (сколько брёвен сейчас), и mock-сервер (подкинуть брёвна).

const HOUR_MS = 60 * 60 * 1000;

export const CAMPFIRE_LABELS: Record<CampfireState, string> = {
  out: "Костёр потух",
  smoldering: "Костёр тлеет",
  burning: "Костёр горит",
  blazing: "Костёр пылает",
};

//сколько целых часов прошло с последнего изменения запаса
function getBurnedLogs(campfire: Campfire, now: Date): number {
  const elapsed = now.getTime() - new Date(campfire.updatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / HOUR_MS) * BURN_LOGS_PER_HOUR);
}

//сколько брёвен в костре прямо сейчас: сохранённый запас минус сгоревшие, но не меньше 0
export function getCurrentLogs(campfire: Campfire, now = new Date()): number {
  return Math.max(0, campfire.logs - getBurnedLogs(campfire, now));
}

export function getCampfireState(logs: number): CampfireState {
  if (logs >= CAMPFIRE_THRESHOLDS.blazing) return "blazing";
  if (logs >= CAMPFIRE_THRESHOLDS.burning) return "burning";
  if (logs >= CAMPFIRE_THRESHOLDS.smoldering) return "smoldering";
  return "out";
}

//сколько брёвен нужно для следующего состояния; null — костёр уже пылает
export function getNextThreshold(state: CampfireState): number | null {
  if (state === "out") return CAMPFIRE_THRESHOLDS.smoldering;
  if (state === "smoldering") return CAMPFIRE_THRESHOLDS.burning;
  if (state === "burning") return CAMPFIRE_THRESHOLDS.blazing;
  return null;
}

//через сколько минут сгорит следующее бревно
export function getMinutesToNextBurn(campfire: Campfire, now = new Date()): number | null {
  if (getCurrentLogs(campfire, now) === 0) {
    return null;
  }

  const elapsed = now.getTime() - new Date(campfire.updatedAt).getTime();
  const sinceLastBurn = elapsed % HOUR_MS;

  return Math.ceil((HOUR_MS - sinceLastBurn) / 60_000);
}

//подкинуть брёвна: не больше 100, лишние не добавляются.
//Возвращает новый костёр и сколько брёвен реально добавилось.
export function addLogs(
  campfire: Campfire,
  amount: number,
  now = new Date(),
): { campfire: Campfire; added: number } {
  const current = getCurrentLogs(campfire, now);
  const next = Math.min(MAX_LOGS, current + amount);

  //начатый час сгорания не теряем: отсчёт продолжается с последнего сгоревшего бревна
  const burnedHours = getBurnedLogs(campfire, now) / BURN_LOGS_PER_HOUR;
  const updatedAt =
    current === 0
      ? now
      : new Date(new Date(campfire.updatedAt).getTime() + burnedHours * HOUR_MS);

  return {
    campfire: { logs: next, updatedAt: updatedAt.toISOString() },
    added: next - current,
  };
}
