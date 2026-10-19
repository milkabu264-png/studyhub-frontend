import type { FocusSession } from "../types/focus.ts";

//сколько минут фокуса было n дней назад (0 — в этот день таймер не включали)
const MINUTES_PER_DAY = [50, 25, 0, 75, 25, 50, 0, 25, 100, 50, 25, 0, 50, 25];

//история фокус-сессий за две недели — для статистики
export function createSeedFocusSessions(): FocusSession[] {
  const sessions: FocusSession[] = [];
  let id = 1;

  MINUTES_PER_DAY.forEach((minutes, index) => {
    let left = minutes;
    let hour = 10;

    while (left > 0) {
      const planned = Math.min(left, 50);
      //каждая четвёртая сессия прервана на середине
      const interrupted = id % 4 === 0;
      const focused = interrupted ? Math.round(planned / 2) : planned;

      const startedAt = new Date();
      startedAt.setDate(startedAt.getDate() - (index + 1));
      startedAt.setHours(hour, 0, 0, 0);

      const endedAt = new Date(startedAt.getTime() + focused * 60_000);

      sessions.push({
        id: id++,
        plannedSeconds: planned * 60,
        focusedSeconds: focused * 60,
        status: interrupted ? "interrupted" : "completed",
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      });

      left -= planned;
      hour += 2;
    }
  });

  return sessions;
}
