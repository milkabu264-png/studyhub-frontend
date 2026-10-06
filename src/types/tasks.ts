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
  completedAt: string | null;
}

//интерфейс для задачи, который описывает все свойства задачи,
//включая id, заголовок, описание, дату, сложность, категорию, статус,
//дату создания и дату завершения (если задача завершена).