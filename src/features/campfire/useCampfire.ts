import { useEffect, useState } from "react";

import { getCampfire } from "../../services/campfireApi";
import { getErrorMessage } from "../../services/api";
import {
  getCampfireState,
  getCurrentLogs,
  getMinutesToNextBurn,
  getNextThreshold,
} from "./campfireUtils";

import type { Campfire } from "../../types/campfire";

//как часто пересчитываем, сколько брёвен сгорело (костёр теряет 1 бревно в час)
const TICK_MS = 30_000;

// CONTROLLER костра (C в MVC).
//
// Загружает костёр с сервера и каждые полминуты пересчитывает, сколько брёвен осталось.
// Брёвна добавляет не он, а выполнение задачи: сервер возвращает новый костёр,
// и страница передаёт его сюда через applyCampfire.

export default function useCampfire() {
  const [campfire, setCampfire] = useState<Campfire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  async function loadCampfire() {
    setIsLoading(true);
    setError(null);

    try {
      setCampfire(await getCampfire());
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось загрузить костёр. Попробуйте позже"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCampfire();

    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const logs = campfire ? getCurrentLogs(campfire, now) : 0;
  const state = getCampfireState(logs);
  const nextThreshold = getNextThreshold(state);

  return {
    logs,
    state,
    //сколько брёвен не хватает до следующего состояния; null — уже пылает
    logsToNextState: nextThreshold === null ? null : nextThreshold - logs,
    minutesToNextBurn: campfire ? getMinutesToNextBurn(campfire, now) : null,
    isLoading,
    error,
    reloadCampfire: loadCampfire,
    applyCampfire: (next: Campfire) => {
      setCampfire(next);
      setNow(new Date());
    },
  };
}
