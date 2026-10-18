import type { TaskDifficulty } from "./task";

export type StatisticsPeriod = | "day" | "week" | "month" | "all";

//за какой период считаем статистику — те же варианты, что были в выпадающем списке

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

export const POINTS_BY_DIFFICULTY: Record<TaskDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

//сколько очков даёт выполненная задача каждой сложности
