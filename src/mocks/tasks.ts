import type { Task } from "../types/task.ts";

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
];