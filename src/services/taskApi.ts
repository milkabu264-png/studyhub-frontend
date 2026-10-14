import { apiRequest } from "./api";

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task.ts";

//без даты — все задачи пользователя (нужны для вкладок «В работе» / «Предстоящие» / «Сожжённые»),
//с датой — только задачи на этот день
export function getTasks(date?: string) {
  return apiRequest<Task[]>(
    date ? `/tasks?date=${date}` : "/tasks",
  );
}

export function createTask(
  data: CreateTaskRequest,
) {
  return apiRequest<Task>(
    "/tasks",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateTask(
  id: number,
  data: UpdateTaskRequest,
) {
  return apiRequest<Task>(
    `/tasks/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function deleteTask(
  id: number,
) {
  return apiRequest<void>(
    `/tasks/${id}`,
    {
      method: "DELETE",
    },
  );
}

export function completeTask(
  id: number,
) {
  return apiRequest<Task>(
    `/tasks/${id}/complete`,
    {
      method: "POST",
    },
  );
}

//вернуть выполненную задачу обратно в работу (снять галочку)
export function restoreTask(
  id: number,
) {
  return apiRequest<Task>(
    `/tasks/${id}/restore`,
    {
      method: "POST",
    },
  );
}

export function failTask(
  id: number,
) {
  return apiRequest<Task>(
    `/tasks/${id}/fail`,
    {
      method: "POST",
    },
  );
}