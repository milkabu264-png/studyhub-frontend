import { USE_MOCKS, apiRequest } from "./api";
import { mockFocus } from "../mocks/mockServer";

import type {
  FinishFocusRequest,
  FocusSession,
  StartFocusRequest,
} from "../types/focus.ts";

//все сессии пользователя — для статистики (время фокуса за период)
export function getFocusSessions() {
  if (USE_MOCKS) return mockFocus.getAll();

  return apiRequest<FocusSession[]>(
    "/focus/sessions",
  );
}

//начать сессию; если уже идёт другая — сервер отвечает 409
export function startFocusSession(
  data: StartFocusRequest,
) {
  if (USE_MOCKS) return mockFocus.start(data);

  return apiRequest<FocusSession>(
    "/focus/sessions",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

//завершить сессию: время вышло (completed) или нажали «Стоп» (interrupted)
export function finishFocusSession(
  id: number,
  data: FinishFocusRequest,
) {
  if (USE_MOCKS) return mockFocus.finish(id, data);

  return apiRequest<FocusSession>(
    `/focus/sessions/${id}/finish`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}
