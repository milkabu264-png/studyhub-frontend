import type { ApiError } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL;

//пока backend не готов, frontend работает на моках из src/mocks
//(VITE_USE_MOCKS=true в .env). Когда backend запущен — ставим false.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

//ошибка запроса: помимо текста хранит HTTP-статус,
//чтобы отличать «неверные данные» (400, 409) от «нет входа» (401) и сбоя сервера (500).
//status = 0 — сервер вообще не ответил.
export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

// ---------- токен сессии ----------

const TOKEN_KEY = "studyhub-token";

//событие «сессия закончилась» — его слушает AuthProvider и переводит на страницу входа
export const SESSION_EXPIRED_EVENT = "studyhub:session-expired";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    //хранилище недоступно — токен проживёт до перезагрузки страницы
  }
}

export function notifySessionExpired() {
  setToken(null);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

// ---------- запрос ----------

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,

      headers: {
        "Content-Type": "application/json",
        //все запросы, кроме входа и регистрации, требуют токен (п. 2.5)
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    //fetch падает, только если сервер не ответил совсем
    throw new ApiRequestError(0, "Не удалось связаться с сервером");
  }

  //это асинхронная функция (может содержать await),
  //которая выполняет HTTP-запрос к API и возвращает результат в виде объекта типа T.

  if (!response.ok) {
    let message = "Произошла ошибка";

    try {
      const error = (await response.json()) as ApiError; //пытаемся достать причину ошибки

      if (error.message) {
        message = error.message; //есть ли текст ошибки, если есть - то показываем
      }
    } catch {
      message = "Не удалось получить ответ от сервера";
    }

    //токен недействителен или истёк — выходим на страницу входа
    if (response.status === 401 && token) {
      notifySessionExpired();
    }

    throw new ApiRequestError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  } //сервер ответил успешно, но без контента (тело ответа пустое)

  return response.json() as Promise<T>;
}

//Текст ошибки для пользователя.
//Если сервер объяснил, что не так с данными (400, 404, 409, 423 …), показываем его текст —
//он уже на русском и понятен. Если сервер упал или недоступен — общий текст для этого действия
//(«Не удалось создать задачу. Попробуйте позже»), без технических кодов (п. 2.10).
export function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof ApiRequestError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}
