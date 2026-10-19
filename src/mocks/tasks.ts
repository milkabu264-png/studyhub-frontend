import type { Task } from "../types/task.ts";
import { createTaskHistory } from "./taskHistory.ts";

//дата через n дней от сегодняшней в формате YYYY-MM-DD,
//чтобы в моках всегда были задачи «на сегодня», «на завтра» и т.д.
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

//задачи демо-пользователя: сегодня, ближайшие дни, просроченные и история за месяц
export function createSeedTasks(): Task[] {
  const now = new Date().toISOString();

  const current: Task[] = [
    {
      id: 1,
      title: "Подготовить конспект по физике",
      description: "Повторить главы перед семинаром",
      date: daysFromNow(-2),
      difficulty: "medium",
      category: "Учёба",
      status: "active",
      createdAt: hoursAgo(80),
      completedAt: null,
    },
    {
      id: 2,
      title: "Решить 10 задач по математике",
      description: null,
      date: daysFromNow(-1),
      difficulty: "hard",
      category: "Учёба",
      status: "active",
      createdAt: hoursAgo(50),
      completedAt: null,
    },
    {
      id: 3,
      title: "Подготовить презентацию",
      description: "Начать с истории клиента, меньше текста на слайдах",
      date: daysFromNow(0),
      difficulty: "medium",
      category: "Работа",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
    {
      id: 4,
      title: "Прочитать главу книги",
      description: null,
      date: daysFromNow(0),
      difficulty: "easy",
      category: "Личное",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
    {
      id: 5,
      title: "Сдать лабораторную по ООП",
      description: "Диаграмма классов + отчёт",
      date: daysFromNow(0),
      difficulty: "hard",
      category: "Учёба",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
    {
      id: 6,
      title: "Ответить на письма",
      description: null,
      date: daysFromNow(0),
      difficulty: "easy",
      category: "Работа",
      status: "completed",
      createdAt: hoursAgo(5),
      completedAt: hoursAgo(2),
    },
    {
      id: 7,
      title: "Составить план на неделю",
      description: null,
      date: daysFromNow(1),
      difficulty: "easy",
      category: "Личное",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
    {
      id: 8,
      title: "Собрать референсы для сайта",
      description: null,
      date: daysFromNow(3),
      difficulty: "medium",
      category: "Работа",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
    {
      id: 9,
      title: "Подготовиться к экзамену по ООП",
      description: null,
      date: daysFromNow(12),
      difficulty: "hard",
      category: "Учёба",
      status: "active",
      createdAt: now,
      completedAt: null,
    },
  ];

  return [...current, ...createTaskHistory()];
}
