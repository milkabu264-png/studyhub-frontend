import { useEffect, useState } from "react";

import {
  completeTask,
  createTask,
  deleteTask,
  failTask,
  getTasks,
  updateTask,
} from "../../services/taskApi";
import type { CompleteTaskResponse } from "../../services/taskApi";
import { getErrorMessage } from "../../services/api";
import { failure, success } from "../../shared/result";
import type { ActionResult } from "../../shared/result";

import type { CreateTaskRequest, Task, UpdateTaskRequest } from "../../types/task";

// CONTROLLER задач (C в MVC).
//
// Связывает Model (types/task.ts + services/taskApi.ts) и View (TaskList, TaskCard, HomePage):
//  - загружает задачи;
//  - хранит их в состоянии;
//  - создаёт, изменяет, отмечает и удаляет задачи.
//
// Правило из требований: отмеченную (выполненную или невыполненную) задачу
// нельзя изменить, отменить или удалить. Сервер это тоже проверяет.

export default function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);

    try {
      setTasks(await getTasks());
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось загрузить задачи. Попробуйте позже"));
    } finally {
      setIsLoading(false);
    }
  }

  //загружаем задачи один раз при открытии страницы
  useEffect(() => {
    void loadTasks();
  }, []);

  function replaceTask(updated: Task) {
    setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
  }

  function isMarked(id: number): boolean {
    return tasks.find((task) => task.id === id)?.status !== "active";
  }

  async function handleCreateTask(data: CreateTaskRequest): Promise<ActionResult<Task>> {
    try {
      const created = await createTask(data);
      setTasks((current) => [...current, created]);
      return success(created);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось создать задачу. Попробуйте позже"));
    }
  }

  async function handleUpdateTask(id: number, data: UpdateTaskRequest): Promise<ActionResult<Task>> {
    if (isMarked(id)) {
      return failure("Отмеченную задачу нельзя изменить");
    }

    try {
      const updated = await updateTask(id, data);
      replaceTask(updated);
      return success(updated);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось сохранить. Попробуйте позже"));
    }
  }

  //«Выполнено»: задача отмечается, в костёр летят брёвна (ответ сервера содержит новый костёр)
  async function handleCompleteTask(id: number): Promise<ActionResult<CompleteTaskResponse>> {
    if (isMarked(id)) {
      return failure("Задача уже завершена");
    }

    try {
      const result = await completeTask(id);
      replaceTask(result.task);
      return success(result);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось завершить задачу. Попробуйте ещё раз"));
    }
  }

  //«Не выполнил»: задача попадает в статистику как невыполненная, брёвен не даёт
  async function handleFailTask(id: number): Promise<ActionResult<Task>> {
    if (isMarked(id)) {
      return failure("Задача уже отмечена, изменить её нельзя");
    }

    try {
      const updated = await failTask(id);
      replaceTask(updated);
      return success(updated);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось обновить задачу. Попробуйте позже"));
    }
  }

  async function handleDeleteTask(id: number): Promise<ActionResult> {
    if (isMarked(id)) {
      return failure("Отмеченную задачу удалить нельзя");
    }

    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      return success(undefined);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось удалить задачу. Попробуйте позже"));
    }
  }

  return {
    tasks,
    isLoading,
    error,
    reloadTasks: loadTasks,
    handleCreateTask,
    handleUpdateTask,
    handleCompleteTask,
    handleFailTask,
    handleDeleteTask,
  };
}
