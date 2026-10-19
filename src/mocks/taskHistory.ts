import type { Task, TaskDifficulty } from "../types/task.ts";

// Выполненные и невыполненные задачи за прошлые 30 дней — чтобы статистике
// и календарю было что показать без backend.

const TITLES = [
  "Разобрать почту",
  "Повторить лекцию",
  "Сходить на тренировку",
  "Сделать домашнее задание",
  "Прочитать статью",
  "Позвонить родителям",
  "Обновить резюме",
  "Решить задачи по математике",
];

const CATEGORIES = ["Учёба", "Работа", "Личное"];
const DIFFICULTIES: TaskDifficulty[] = ["easy", "medium", "hard"];

//сколько задач выполнено n дней назад — «живой» неровный ритм, без случайности
const COMPLETED_PER_DAY = [3, 2, 4, 1, 0, 3, 2, 5, 2, 1, 0, 2, 3, 4, 1, 2, 3, 0, 1, 2, 4, 3, 2, 1, 0, 2, 3, 1, 2, 3];

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createTaskHistory(): Task[] {
  const tasks: Task[] = [];
  let id = 1000;

  COMPLETED_PER_DAY.forEach((count, index) => {
    const daysAgo = index + 1;

    for (let i = 0; i < count; i += 1) {
      const doneAt = new Date();
      doneAt.setDate(doneAt.getDate() - daysAgo);
      doneAt.setHours(9 + i * 2, 15, 0, 0);

      tasks.push({
        id: id++,
        title: TITLES[(index + i) % TITLES.length],
        description: null,
        date: toDateString(doneAt),
        difficulty: DIFFICULTIES[(index + i) % DIFFICULTIES.length],
        category: CATEGORIES[(index * 2 + i) % CATEGORIES.length],
        status: "completed",
        createdAt: doneAt.toISOString(),
        completedAt: doneAt.toISOString(),
      });
    }

    //примерно раз в неделю одна задача остаётся невыполненной
    if (daysAgo % 6 === 0) {
      const markedAt = new Date();
      markedAt.setDate(markedAt.getDate() - daysAgo);
      markedAt.setHours(21, 0, 0, 0);

      tasks.push({
        id: id++,
        title: "Отложенное дело",
        description: null,
        date: toDateString(markedAt),
        difficulty: "medium",
        category: "Личное",
        status: "failed",
        createdAt: markedAt.toISOString(),
        completedAt: markedAt.toISOString(),
      });
    }
  });

  return tasks;
}
