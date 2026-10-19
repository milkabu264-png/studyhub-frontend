import type { TaskDifficulty } from "./task";

export type StatisticsPeriod = | "day" | "week" | "month" | "range" | "all";

//за какой период считаем статистику; range — произвольный диапазон дат

export interface DateRange {
  from: string;
  to: string;
}

export interface DayActivity {
  date: string;
  completed: number;
}

//сколько задач выполнено в конкретный день (для графика активности)

export interface CategoryStats {
  category: string;
  completed: number;
}

export interface Statistics {
  period: StatisticsPeriod;

  points: number;
  //очки за всё время — показываются при любом периоде
  totalPoints: number;

  //время фокуса за период без пауз, в секундах
  focusSeconds: number;

  completed: number;
  failed: number;
  active: number;

  completionRate: number;

  byDifficulty: Record<TaskDifficulty, number>;

  byCategory: CategoryStats[];

  activity: DayActivity[];
  //столбик графика — это день или неделя (для «Всё время» — недели)
  activityUnit: "day" | "week";

  streakDays: number;
  bestDay: DayActivity | null;
}

//итог за период: очки, выполненные / проваленные / активные задачи,
//процент выполнения, разбивка по сложности и категориям,
//активность по дням, серия дней подряд и самый продуктивный день.
