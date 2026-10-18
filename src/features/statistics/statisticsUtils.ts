import type { Task } from "../../types/task";
import { POINTS_BY_DIFFICULTY } from "../../types/statistics";
import type {
  DayActivity,
  Statistics,
  StatisticsPeriod,
} from "../../types/statistics";

// Подсчёт статистики по списку задач — чистые функции без React.
// Сейчас статистика считается на frontend из тех же задач, что приходят с GET /tasks.

export const PERIOD_LABELS: Record<StatisticsPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  all: "Всё время",
};

//сколько дней входит в период (для «Всё время» — без ограничения)
const PERIOD_DAYS: Record<StatisticsPeriod, number | null> = {
  day: 1,
  week: 7,
  month: 30,
  all: null,
};

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

//с какого дня начинается период; null — «Всё время»
function getPeriodStart(period: StatisticsPeriod, now: Date): Date | null {
  const days = PERIOD_DAYS[period];

  if (days === null) {
    return null;
  }

  return addDays(startOfDay(now), -(days - 1));
}

//день, к которому относится задача: выполненная — по дню выполнения, остальные — по дедлайну
function getTaskDay(task: Task): Date {
  if (task.status === "completed" && task.completedAt) {
    return startOfDay(new Date(task.completedAt));
  }

  return new Date(`${task.date}T00:00:00`);
}

function isInPeriod(day: Date, start: Date | null, now: Date): boolean {
  const end = startOfDay(now);
  return (start === null || day >= start) && day <= end;
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

//столбики графика: по дням (неделя / месяц) или по неделям (всё время)
function buildActivity(
  byDay: Map<string, number>,
  period: StatisticsPeriod,
  now: Date,
): DayActivity[] {
  const today = startOfDay(now);

  if (period === "all") {
    return Array.from({ length: ALL_TIME_WEEKS }, (_, i) => {
      const weekStart = addDays(today, -7 * (ALL_TIME_WEEKS - i) + 1);
      let completed = 0;

      for (let d = 0; d < 7; d += 1) {
        completed += byDay.get(toDayKey(addDays(weekStart, d))) ?? 0;
      }

      return { date: toDayKey(weekStart), completed };
    });
  }

  //для периода «День» всё равно показываем неделю — один столбик ничего не говорит
  const days = period === "month" ? 30 : 7;

  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, -(days - 1 - i));
    return { date: toDayKey(day), completed: byDay.get(toDayKey(day)) ?? 0 };
  });
}

//сколько дней подряд (до сегодня) выполнялась хотя бы одна задача — «огонёк не гаснет»
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
  period: StatisticsPeriod,
  now = new Date(),
): Statistics {
  const start = getPeriodStart(period, now);

  const inPeriod = tasks.filter((task) => isInPeriod(getTaskDay(task), start, now));

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

  const byCategory = [...categories.entries()]
    .map(([category, count]) => ({ category, completed: count }))
    .sort((a, b) => b.completed - a.completed);

  const byDay = countCompletedByDay(tasks);

  //самый продуктивный день внутри периода
  let bestDay: DayActivity | null = null;

  for (const [date, count] of byDay) {
    const day = new Date(`${date}T00:00:00`);

    if (isInPeriod(day, start, now) && (!bestDay || count > bestDay.completed)) {
      bestDay = { date, completed: count };
    }
  }

  return {
    period,
    points,
    completed,
    failed,
    active,
    completionRate: finished === 0 ? 0 : Math.round((completed / finished) * 100),
    byDifficulty,
    byCategory,
    activity: buildActivity(byDay, period, now),
    activityUnit: period === "all" ? "week" : "day",
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
