import type { Task } from "../../types/task";
import { POINTS_BY_DIFFICULTY } from "../../types/task";
import type { FocusSession } from "../../types/focus";
import type {
  DateRange,
  DayActivity,
  Statistics,
  StatisticsPeriod,
} from "../../types/statistics";

// Подсчёт статистики — чистые функции без React (п. 1.5).
// Статистика не вводится вручную: она считается из задач (GET /tasks) и фокус-сессий (GET /focus/sessions).

export const PERIOD_LABELS: Record<StatisticsPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  range: "Даты",
  all: "Всё время",
};

//сколько дней входит в период (для «Всё время» — без ограничения; для «Даты» — свои границы)
const PERIOD_DAYS: Record<Exclude<StatisticsPeriod, "range">, number | null> = {
  day: 1,
  week: 7,
  month: 30,
  all: null,
};

//в произвольном диапазоне до стольких дней график по дням, дальше — по неделям
const RANGE_DAILY_LIMIT = 31;

//сколько недель показываем на графике для «Всё время»
const ALL_TIME_WEEKS = 12;

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

//Date → "YYYY-MM-DD" по местному времени
export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface PeriodBounds {
  //null — без начала («Всё время»)
  start: Date | null;
  end: Date;
}

//границы периода (включительно)
function getPeriodBounds(period: StatisticsPeriod, now: Date, range?: DateRange): PeriodBounds {
  if (period === "range" && range) {
    return {
      start: new Date(`${range.from}T00:00:00`),
      end: new Date(`${range.to}T00:00:00`),
    };
  }

  const days = period === "range" ? 7 : PERIOD_DAYS[period];
  const end = startOfDay(now);

  return { start: days === null ? null : addDays(end, -(days - 1)), end };
}

//день, к которому относится задача: выполненная — по дню выполнения, остальные — по дедлайну
function getTaskDay(task: Task): Date {
  if (task.status === "completed" && task.completedAt) {
    return startOfDay(new Date(task.completedAt));
  }

  return new Date(`${task.date}T00:00:00`);
}

function isInPeriod(day: Date, bounds: PeriodBounds): boolean {
  return (bounds.start === null || day >= bounds.start) && day <= bounds.end;
}

//сколько задач выполнено в каждый день: { "2026-10-14": 3, ... }
function countCompletedByDay(tasks: Task[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (task.status === "completed" && task.completedAt) {
      const key = toDayKey(new Date(task.completedAt));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
}

//сумма выполненных задач за 7 дней, начиная с weekStart
function sumWeek(byDay: Map<string, number>, weekStart: Date): number {
  let completed = 0;

  for (let d = 0; d < 7; d += 1) {
    completed += byDay.get(toDayKey(addDays(weekStart, d))) ?? 0;
  }

  return completed;
}

//столбики графика: по дням (неделя, месяц, короткий диапазон) или по неделям (всё время, длинный диапазон)
function buildActivity(
  byDay: Map<string, number>,
  period: StatisticsPeriod,
  bounds: PeriodBounds,
): { activity: DayActivity[]; unit: "day" | "week" } {
  const end = bounds.end;

  if (period === "range" && bounds.start) {
    const days = Math.round((end.getTime() - bounds.start.getTime()) / 86_400_000) + 1;

    if (days <= RANGE_DAILY_LIMIT) {
      const activity = Array.from({ length: days }, (_, i) => {
        const day = addDays(bounds.start as Date, i);
        return { date: toDayKey(day), completed: byDay.get(toDayKey(day)) ?? 0 };
      });

      return { activity, unit: "day" };
    }

    const weeks = Math.ceil(days / 7);
    const activity = Array.from({ length: weeks }, (_, i) => {
      const weekStart = addDays(bounds.start as Date, i * 7);
      return { date: toDayKey(weekStart), completed: sumWeek(byDay, weekStart) };
    });

    return { activity, unit: "week" };
  }

  if (period === "all") {
    const activity = Array.from({ length: ALL_TIME_WEEKS }, (_, i) => {
      const weekStart = addDays(end, -7 * (ALL_TIME_WEEKS - i) + 1);
      return { date: toDayKey(weekStart), completed: sumWeek(byDay, weekStart) };
    });

    return { activity, unit: "week" };
  }

  //для периода «День» всё равно показываем неделю — один столбик ничего не говорит
  const days = period === "month" ? 30 : 7;

  const activity = Array.from({ length: days }, (_, i) => {
    const day = addDays(end, -(days - 1 - i));
    return { date: toDayKey(day), completed: byDay.get(toDayKey(day)) ?? 0 };
  });

  return { activity, unit: "day" };
}

//сколько дней подряд (до сегодня) выполнялась хотя бы одна задача
function countStreak(byDay: Map<string, number>, now: Date): number {
  let day = startOfDay(now);

  //если сегодня ещё ничего не сделано, серия не прерывается — считаем со вчера
  if (!byDay.get(toDayKey(day))) {
    day = addDays(day, -1);
  }

  let streak = 0;

  while (byDay.get(toDayKey(day))) {
    streak += 1;
    day = addDays(day, -1);
  }

  return streak;
}

export function calculateStatistics(
  tasks: Task[],
  focusSessions: FocusSession[],
  period: StatisticsPeriod,
  range?: DateRange,
  now = new Date(),
): Statistics {
  const bounds = getPeriodBounds(period, now, range);

  const inPeriod = tasks.filter((task) => isInPeriod(getTaskDay(task), bounds));

  const completedTasks = inPeriod.filter((task) => task.status === "completed");
  const failed = inPeriod.filter((task) => task.status === "failed").length;
  const active = inPeriod.filter((task) => task.status === "active").length;

  const completed = completedTasks.length;
  const finished = completed + failed;

  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const categories = new Map<string, number>();
  let points = 0;

  for (const task of completedTasks) {
    byDifficulty[task.difficulty] += 1;
    points += POINTS_BY_DIFFICULTY[task.difficulty];

    const category = task.category ?? "Без категории";
    categories.set(category, (categories.get(category) ?? 0) + 1);
  }

  //очки за всё время — сумма за все выполненные задачи; очки только растут
  const totalPoints = tasks
    .filter((task) => task.status === "completed")
    .reduce((sum, task) => sum + POINTS_BY_DIFFICULTY[task.difficulty], 0);

  //время фокуса без пауз по завершённым и прерванным сессиям
  const focusSeconds = focusSessions
    .filter(
      (session) =>
        session.status !== "active" &&
        isInPeriod(startOfDay(new Date(session.startedAt)), bounds),
    )
    .reduce((sum, session) => sum + session.focusedSeconds, 0);

  const byCategory = [...categories.entries()]
    .map(([category, count]) => ({ category, completed: count }))
    .sort((a, b) => b.completed - a.completed);

  const byDay = countCompletedByDay(tasks);

  //самый продуктивный день внутри периода
  let bestDay: DayActivity | null = null;

  for (const [date, count] of byDay) {
    const day = new Date(`${date}T00:00:00`);

    if (isInPeriod(day, bounds) && (!bestDay || count > bestDay.completed)) {
      bestDay = { date, completed: count };
    }
  }

  const { activity, unit } = buildActivity(byDay, period, bounds);

  return {
    period,
    points,
    totalPoints,
    focusSeconds,
    completed,
    failed,
    active,
    completionRate: finished === 0 ? 0 : Math.round((completed / finished) * 100),
    byDifficulty,
    byCategory,
    activity,
    activityUnit: unit,
    streakDays: countStreak(byDay, now),
    bestDay,
  };
}

//«14 окт.»
export function formatShortDate(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

//«пн», «вт» …
export function formatWeekday(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("ru-RU", {
    weekday: "short",
  });
}

export function isToday(dayKey: string, now = new Date()): boolean {
  return dayKey === toDayKey(now);
}
