import type { Task, TaskDifficulty } from "../../types/task";

// Вспомогательные функции для списка задач.
// Здесь нет React — только логика над массивом задач,
// поэтому ей могут пользоваться и главная, и будущая страница задач, и статистика.

export type TaskTab = "inProgress" | "upcoming" | "burned";

//вкладки над списком задач

export const TASK_TABS: { tab: TaskTab; label: string }[] = [
  { tab: "inProgress", label: "В работе" },
  { tab: "upcoming", label: "Предстоящие" },
  { tab: "burned", label: "Сожжённые" },
];

// Задачи с дедлайном в ближайшие 7 дней (и просроченные) — «В работе»,
// всё, что дальше, — «Предстоящие».
const IN_PROGRESS_DAYS = 7;

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

// Сколько дней до даты задачи: 0 — сегодня, 1 — завтра, -1 — вчера.
export function getDaysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${date}T00:00:00`);

  return Math.round(
    (deadline.getTime() - today.getTime()) / 86_400_000,
  );
}

export function isTaskOverdue(task: Task): boolean {
  return task.status === "active" && getDaysUntil(task.date) < 0;
}

// В какую вкладку попадает задача.
// Проваленные (failed) пока нигде не показываем — для них нет интерфейса.
export function getTaskTab(task: Task): TaskTab | null {
  if (task.status === "completed") {
    return "burned";
  }

  if (task.status === "failed") {
    return null;
  }

  return getDaysUntil(task.date) <= IN_PROGRESS_DAYS
    ? "inProgress"
    : "upcoming";
}

export function getTasksForTab(tasks: Task[], tab: TaskTab): Task[] {
  return tasks
    .filter((task) => getTaskTab(task) === tab)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function countTasksByTab(tasks: Task[]): Record<TaskTab, number> {
  const counts: Record<TaskTab, number> = {
    inProgress: 0,
    upcoming: 0,
    burned: 0,
  };

  for (const task of tasks) {
    const tab = getTaskTab(task);

    if (tab) {
      counts[tab] += 1;
    }
  }

  return counts;
}

// Прогресс: сколько сожжено из задач «В работе» + «Сожжённые».
export function getProgress(tasks: Task[]) {
  const counts = countTasksByTab(tasks);

  const done = counts.burned;
  const total = counts.inProgress + counts.burned;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent };
}

// «Сегодня», «Завтра», «Вчера» или «7 октября»
export function getDateLabel(date: string): string {
  const days = getDaysUntil(date);

  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  if (days === -1) return "Вчера";

  return new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

// Сколько задач сожжено сегодня — это «брёвна» для костра.
export function countBurnedToday(tasks: Task[]): number {
  const today = new Date().toDateString();

  return tasks.filter(
    (task) =>
      task.status === "completed" &&
      task.completedAt !== null &&
      new Date(task.completedAt).toDateString() === today,
  ).length;
}

// Дата в формате YYYY-MM-DD (как в поле date у задачи).
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Склонение слова после числа: задача / задачи / задач
export function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];

  return forms[2];
}
