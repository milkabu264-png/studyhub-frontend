import { apiRequest } from "./api";

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task.ts";

export function getTasks(date: string) {
  return apiRequest<Task[]>(
    `/tasks?date=${date}`,
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