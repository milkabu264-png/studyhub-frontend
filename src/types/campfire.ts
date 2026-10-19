export type CampfireState =
  | "out"
  | "smoldering"
  | "burning"
  | "blazing";

//состояние костра: потух, тлеет, горит, пылает

export interface Campfire {
  //запас брёвен на момент updatedAt (0–100)
  logs: number;

  //когда запас последний раз менялся; с этого момента костёр сгорает по 1 бревну в час
  updatedAt: string;
}

//так костёр хранится в БД и приходит с GET /campfire.
//Сколько брёвен осталось прямо сейчас, frontend считает сам (см. features/campfire/campfireUtils.ts).

export const MAX_LOGS = 100;

export const BURN_LOGS_PER_HOUR = 1;

//пороги состояний одинаковы для всех и не настраиваются
export const CAMPFIRE_THRESHOLDS: Record<Exclude<CampfireState, "out">, number> = {
  smoldering: 1,
  burning: 30,
  blazing: 70,
};
