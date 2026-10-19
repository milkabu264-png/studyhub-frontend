export type TaskDifficulty =|"easy"|"medium"|"hard";

//однозначно задаем каким может быть параметр сложности задачи, 
//чтобы не было возможности передать что-то другое, 
//кроме этих трех значений.

export type TaskStatus = | "active" | "completed" | "failed";

//аналогично задаем статус задачи, 
//чтобы не было возможности передать что-то другое, 
//кроме этих трех значений.

export interface Task {
  id: number;

  title: string;
  description: string | null;

  date: string;

  difficulty: TaskDifficulty;

  category: string | null;

  status: TaskStatus;

  createdAt: string;
  //когда задачу отметили — выполненной или невыполненной; у активной задачи null
  completedAt: string | null;
}

//интерфейс для задачи, который описывает все свойства задачи,
//включая id, заголовок, описание, дату, сложность, категорию, статус,
//дату создания и дату завершения (если задача завершена).

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  date: string;
  difficulty: TaskDifficulty;
  category: string | null;
}

//интерфейс для запроса на создание задачи, который описывает все свойства задачи,
//кроме id, статуса, даты создания и даты завершения, которые будут установлены сервером.

export interface UpdateTaskRequest {
  title: string;
  description: string | null;
  date: string;
  difficulty: TaskDifficulty;
  category: string | null;
}

//интерфейс для запроса на обновление задачи, который описывает все свойства задачи,
//кроме id, статуса, даты создания и даты завершения, которые будут установлены сервером.

export const TASK_TITLE_MAX_LENGTH = 200;

//название задачи — не длиннее 200 символов

export const POINTS_BY_DIFFICULTY: Record<TaskDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

//сколько очков даёт выполненная задача. Очки только копятся и никогда не сгорают.

export const LOGS_BY_DIFFICULTY: Record<TaskDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

//сколько брёвен выполненная задача подкидывает в костёр. Брёвна, в отличие от очков, сгорают.
