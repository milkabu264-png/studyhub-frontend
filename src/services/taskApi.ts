import { USE_MOCKS, apiRequest } from "./api";
import { mockTasks } from "../mocks/mockServer";

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task.ts";
import type { Campfire } from "../types/campfire.ts";

//ответ на выполнение задачи: задача, обновлённый костёр и сколько брёвен реально добавилось
//(меньше положенного — значит, костёр уже был почти полон)
export interface CompleteTaskResponse {
  task: Task;
  campfire: Campfire;
  logsAdded: number;
}

//без даты — все задачи пользователя (для статистики и календаря),
//с датой — только задачи на этот день
export function getTasks(date?: string) {
  if (USE_MOCKS) return mockTasks.getAll(date);

  return apiRequest<Task[]>(
    date ? `/tasks?date=${date}` : "/tasks",
  );
}

export function createTask(
  data: CreateTaskRequest,
) {
  if (USE_MOCKS) return mockTasks.create(data);

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
  if (USE_MOCKS) return mockTasks.update(id, data);

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
  if (USE_MOCKS) return mockTasks.remove(id);

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
  if (USE_MOCKS) return mockTasks.complete(id);

  return apiRequest<CompleteTaskResponse>(
    `/tasks/${id}/complete`,
    {
      method: "POST",
    },
  );
}

export function failTask(
  id: number,
) {
  if (USE_MOCKS) return mockTasks.fail(id);

  return apiRequest<Task>(
    `/tasks/${id}/fail`,
    {
      method: "POST",
    },
  );
}
