import { useEffect, useState } from "react";

import { getTasks } from "../../services/taskApi";
import { USE_MOCKS } from "../../services/api";
import { mockTasks } from "../../mocks/tasks";
import { mockTaskHistory } from "../../mocks/taskHistory";
import { calculateStatistics } from "./statisticsUtils.ts";

import type { Task } from "../../types/task";
import type { StatisticsPeriod } from "../../types/statistics";

// CONTROLLER статистики (C в MVC).
//
// Загружает задачи (Model: services/taskApi.ts), хранит выбранный период
// и отдаёт странице (View) уже посчитанную статистику.

export default function useStatistics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<StatisticsPeriod>("week");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);

    try {
      //на моках добавляем историю прошлых дней, чтобы графику было что показать
      const data = USE_MOCKS ? [...mockTasks, ...mockTaskHistory] : await getTasks();
      setTasks(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  //статистика пересчитывается при каждой смене периода или задач
  const statistics = calculateStatistics(tasks, period);

  return {
    statistics,
    period,
    setPeriod,
    isLoading,
    error,
    reloadStatistics: loadTasks,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером";
  }

  return error instanceof Error ? error.message : "Что-то пошло не так";
}
