import type { Campfire, CampfireState } from "../../types/campfire";
import type { CampfireThresholds } from "../../types/settings";
import { DEFAULT_CAMPFIRE_THRESHOLDS } from "../../types/settings";

// Пороги «брёвен» (сожжённых за сегодня задач), при которых костёр разгорается сильнее,
// берутся из настроек пользователя (страница «Настройки» → «Настройки костра»).
// Пока костёр считается на frontend; когда backend начнёт отдавать GET /campfire,
// эти данные можно будет брать из services/campfireApi.ts.
function getLevels(thresholds: CampfireThresholds): { state: CampfireState; minLogs: number }[] {
  return [
    { state: "embers", minLogs: 0 },
    { state: "low", minLogs: thresholds.low },
    { state: "burning", minLogs: thresholds.burning },
    { state: "blazing", minLogs: thresholds.blazing },
  ];
}

export const CAMPFIRE_LABELS: Record<CampfireState, string> = {
  embers: "Тлеют угольки",
  low: "Огонёк разгорается",
  burning: "Костёр горит",
  blazing: "Пламя до небес",
};

export function getCampfire(
  logsToday: number,
  thresholds: CampfireThresholds = DEFAULT_CAMPFIRE_THRESHOLDS,
): Campfire {
  const levels = getLevels(thresholds);
  let index = 0;

  levels.forEach((level, i) => {
    if (logsToday >= level.minLogs) {
      index = i;
    }
  });

  const next = levels[index + 1];

  return {
    state: levels[index].state,
    logsToday,
    nextThreshold: next ? next.minLogs : null,
  };
}
