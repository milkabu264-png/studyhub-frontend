import { useEffect, useState } from "react";

import { getTasks } from "../../services/taskApi";
import { getFocusSessions } from "../../services/focusApi";
import { getErrorMessage } from "../../services/api";
import { calculateStatistics, toDayKey } from "./statisticsUtils";

import type { Task } from "../../types/task";
import type { FocusSession } from "../../types/focus";
import type { DateRange, StatisticsPeriod } from "../../types/statistics";

// CONTROLLER статистики (C в MVC).
//
// Загружает задачи и фокус-сессии (Model: services/taskApi.ts, services/focusApi.ts),
// хранит выбранный период и отдаёт странице (View) уже посчитанную статистику.

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 13);

  return { from: toDayKey(from), to: toDayKey(to) };
}

export default function useStatistics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [period, setPeriod] = useState<StatisticsPeriod>("week");
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setError(null);

    try {
      const [loadedTasks, loadedSessions] = await Promise.all([getTasks(), getFocusSessions()]);
      setTasks(loadedTasks);
      setFocusSessions(loadedSessions);
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось загрузить статистику. Попробуйте позже"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  //диапазон «с … по …» задан наоборот — подсказка вместо пустых цифр
  const rangeError =
    period === "range" && range.from > range.to ? "Дата «с» должна быть не позже даты «по»" : null;

  //статистика пересчитывается при каждой смене периода или данных
  const statistics = calculateStatistics(
    tasks,
    focusSessions,
    period,
    rangeError ? undefined : range,
  );

  return {
    statistics,
    period,
    setPeriod,
    range,
    setRange,
    rangeError,
    isLoading,
    error,
    reloadStatistics: loadData,
  };
}
