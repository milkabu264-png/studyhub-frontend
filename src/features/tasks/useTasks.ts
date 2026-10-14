import { useEffect, useState } from "react";

import {
  completeTask,
  createTask,
  deleteTask,
  getTasks,
  restoreTask,
} from "../../services/taskApi";
import { USE_MOCKS } from "../../services/api";
import { mockTasks } from "../../mocks/tasks";

import type { CreateTaskRequest, Task } from "../../types/task";

// CONTROLLER задач (C в MVC).
//
// Связывает Model (types/task.ts + services/taskApi.ts) и View (TaskList, TaskCard, HomePage):
//  - загружает задачи;
//  - хранит их в состоянии;
//  - обрабатывает действия пользователя: создать, отметить, удалить, сжечь в костре.
//
// Пока VITE_USE_MOCKS=true, всё работает на моках без backend.
// Когда backend будет готов, достаточно поставить false — запросы уйдут в taskApi.ts.

export default function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);

    try {
      const data = USE_MOCKS ? mockTasks : await getTasks();
      setTasks(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }

  //загружаем задачи один раз при открытии страницы
  useEffect(() => {
    void loadTasks();
  }, []);

  //заменяем одну задачу в списке на новую версию
  function replaceTask(updated: Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === updated.id ? updated : task)),
    );
  }

  async function handleCreateTask(data: CreateTaskRequest) {
    try {
      if (USE_MOCKS) {
        const newTask: Task = {
          id: Date.now(),

          title: data.title,
          description: data.description,
          date: data.date,
          difficulty: data.difficulty,
          category: data.category,

          status: "active",

          createdAt: new Date().toISOString(),
          completedAt: null,
        };

        setTasks((currentTasks) => [...currentTasks, newTask]);
        return;
      }

      const created = await createTask(data);
      setTasks((currentTasks) => [...currentTasks, created]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  //галочка: активная задача становится выполненной (сгорает в костре),
  //выполненная — возвращается в работу
  async function handleToggleComplete(id: number) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return;
    }

    const isCompleted = task.status === "completed";

    try {
      if (USE_MOCKS) {
        replaceTask(
          isCompleted
            ? { ...task, status: "active", completedAt: null }
            : {
                ...task,
                status: "completed",
                completedAt: new Date().toISOString(),
              },
        );
        return;
      }

      replaceTask(isCompleted ? await restoreTask(id) : await completeTask(id));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDeleteTask(id: number) {
    try {
      if (!USE_MOCKS) {
        await deleteTask(id);
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id),
      );
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  //задачу бросили в костёр — сжигаем, только если она ещё активна
  function handleBurnTask(id: number) {
    const task = tasks.find((item) => item.id === id);

    if (task && task.status === "active") {
      void handleToggleComplete(id);
    }
  }

  return {
    tasks,
    isLoading,
    error,
    reloadTasks: loadTasks,
    clearError: () => setError(null),
    handleCreateTask,
    handleToggleComplete,
    handleDeleteTask,
    handleBurnTask,
  };
}

//apiRequest бросает обычный Error с текстом от сервера.
//Если сервер вообще недоступен, fetch бросает TypeError («Failed to fetch»).
function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером";
  }

  return error instanceof Error ? error.message : "Что-то пошло не так";
}
