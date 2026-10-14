import type { Campfire, CampfireState } from "../../types/campfire";

// Пороги «брёвен» (сожжённых за сегодня задач), при которых костёр разгорается сильнее.
// Пока костёр считается на frontend; когда backend начнёт отдавать GET /campfire,
// эти данные можно будет брать из services/campfireApi.ts.
const THRESHOLDS: { state: CampfireState; minLogs: number }[] = [
  { state: "embers", minLogs: 0 },
  { state: "low", minLogs: 1 },
  { state: "burning", minLogs: 3 },
  { state: "blazing", minLogs: 5 },
];

export const CAMPFIRE_LABELS: Record<CampfireState, string> = {
  embers: "Тлеют угольки",
  low: "Огонёк разгорается",
  burning: "Костёр горит",
  blazing: "Пламя до небес",
};

export function getCampfire(logsToday: number): Campfire {
  let index = 0;

  THRESHOLDS.forEach((threshold, i) => {
    if (logsToday >= threshold.minLogs) {
      index = i;
    }
  });

  const next = THRESHOLDS[index + 1];

  return {
    state: THRESHOLDS[index].state,
    logsToday,
    nextThreshold: next ? next.minLogs : null,
  };
}
