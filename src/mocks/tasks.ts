import type { Task } from "../types/task.ts";

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

const now = new Date().toISOString();

export const mockTasks: Task[] = [
  {
    id: 1,

    title: "Подготовить конспект по физике",

    description:
      "Повторить главы перед семинаром",

    date: "2026-10-06",

    difficulty: "medium",

    category: "Учёба",

    status: "active",

    createdAt:
      "2026-10-06T08:30:00Z",

    completedAt: null,
  },

  {
    id: 2,

    title: "Решить 10 задач по математике",

    description: null,

    date: "2026-10-06",

    difficulty: "hard",

    category: "Учёба",

    status: "active",

    createdAt:
      "2026-10-06T09:00:00Z",

    completedAt: null,
  },

  //«В работе» — дедлайн в ближайшую неделю
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
    id: 6,
    title: "Собрать референсы для сайта",
    description: null,
    date: daysFromNow(3),
    difficulty: "medium",
    category: "Работа",
    status: "active",
    createdAt: now,
    completedAt: null,
  },

  //«Предстоящие» — дедлайн дальше недели
  {
    id: 7,
    title: "Подготовиться к экзамену по ООП",
    description: null,
    date: daysFromNow(12),
    difficulty: "hard",
    category: "Учёба",
    status: "active",
    createdAt: now,
    completedAt: null,
  },
  {
    id: 8,
    title: "Записаться к стоматологу",
    description: null,
    date: daysFromNow(20),
    difficulty: "easy",
    category: "Личное",
    status: "active",
    createdAt: now,
    completedAt: null,
  },

  //«Сожжённые» — уже выполненные
  {
    id: 9,
    title: "Ответить на письма",
    description: null,
    date: daysFromNow(0),
    difficulty: "easy",
    category: "Работа",
    status: "completed",
    createdAt: now,
    completedAt: now,
  },
  {
    id: 10,
    title: "Повторить конспект лекции",
    description: null,
    date: daysFromNow(0),
    difficulty: "medium",
    category: "Учёба",
    status: "completed",
    createdAt: now,
    completedAt: now,
  },
];
