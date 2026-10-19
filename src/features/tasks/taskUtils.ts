import type { Task, TaskDifficulty, TaskStatus } from "../../types/task";

// Вспомогательные функции для задач — без React, только логика над массивом.

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  active: "Активна",
  completed: "Выполнена",
  failed: "Не выполнена",
};

// ---------- даты ----------

//Date → "YYYY-MM-DD" по местному времени (так хранится поле date у задачи)
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

export function todayString(): string {
  return toDateString(new Date());
}

export function addDays(date: string, days: number): string {
  const result = parseDate(date);
  result.setDate(result.getDate() + days);
  return toDateString(result);
}

//сколько дней до даты: 0 — сегодня, 1 — завтра, -1 — вчера
export function getDaysUntil(date: string): number {
  const today = parseDate(todayString());
  return Math.round((parseDate(date).getTime() - today.getTime()) / 86_400_000);
}

export function isPastDay(date: string): boolean {
  return date < todayString();
}

//просроченная — неотмеченная задача прошедшего дня (п. 1.2.2)
export function isTaskOverdue(task: Task): boolean {
  return task.status === "active" && isPastDay(task.date);
}

//«Сегодня», «Завтра», «Вчера» или «7 октября»
export function getDateLabel(date: string): string {
  const days = getDaysUntil(date);

  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  if (days === -1) return "Вчера";

  return parseDate(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

//«Среда, 14 октября» — заголовок выбранного дня
export function formatDayTitle(date: string): string {
  const text = parseDate(date).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------- фильтры (п. 1.2.7) ----------

//срок: выбранный день, неделя с выбранного дня или все просроченные
export type TaskRange = | "day" | "week" | "overdue";
export type TaskSort = | "default" | "difficulty" | "status";

export interface TaskFilters {
  status: "all" | TaskStatus;
  difficulty: "all" | TaskDifficulty;
  range: TaskRange;
  sort: TaskSort;
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  difficulty: "all",
  range: "day",
  sort: "default",
};

export function hasActiveFilters(filters: TaskFilters): boolean {
  return filters.status !== "all" || filters.difficulty !== "all" || filters.range !== "day";
}

const DIFFICULTY_ORDER: Record<TaskDifficulty, number> = { hard: 0, medium: 1, easy: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = { active: 0, completed: 1, failed: 2 };

//задачи, которые показываются в списке
export function getVisibleTasks(
  tasks: Task[],
  selectedDate: string,
  filters: TaskFilters,
): Task[] {
  const weekEnd = addDays(selectedDate, 6);

  const inRange = tasks.filter((task) => {
    if (filters.range === "overdue") return isTaskOverdue(task);
    if (filters.range === "week") return task.date >= selectedDate && task.date <= weekEnd;
    return task.date === selectedDate;
  });

  const filtered = inRange.filter(
    (task) =>
      (filters.status === "all" || task.status === filters.status) &&
      (filters.difficulty === "all" || task.difficulty === filters.difficulty),
  );

  return [...filtered].sort((a, b) => {
    if (filters.sort === "difficulty") {
      return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    }

    if (filters.sort === "status") {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }

    //по умолчанию: по дате, внутри дня — сначала активные, потом по времени создания
    return (
      a.date.localeCompare(b.date) ||
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.createdAt.localeCompare(b.createdAt)
    );
  });
}

//прогресс выбранного дня: сколько задач уже отмечено выполненными
export function getDayProgress(tasks: Task[], date: string) {
  const dayTasks = tasks.filter((task) => task.date === date);
  const done = dayTasks.filter((task) => task.status === "completed").length;
  const total = dayTasks.length;

  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// ---------- календарь ----------

export interface DayMarks {
  active: number;
  completed: number;
  overdue: number;
}

//для точек в календаре: сколько задач и каких в каждый день
export function getDayMarks(tasks: Task[]): Map<string, DayMarks> {
  const marks = new Map<string, DayMarks>();

  for (const task of tasks) {
    const mark = marks.get(task.date) ?? { active: 0, completed: 0, overdue: 0 };

    if (task.status === "completed") mark.completed += 1;
    if (task.status === "active") mark.active += 1;
    if (isTaskOverdue(task)) mark.overdue += 1;

    marks.set(task.date, mark);
  }

  return marks;
}

// ---------- текст ----------

//склонение слова после числа: задача / задачи / задач
export function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];

  return forms[2];
}
