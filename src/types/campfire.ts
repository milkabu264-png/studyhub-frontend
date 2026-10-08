export type CampfireState =
  | "embers"
  | "low"
  | "burning"
  | "blazing";

export interface Campfire {
  state: CampfireState;

  logsToday: number;

  nextThreshold: number | null;
}