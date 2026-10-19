# StudyHub Frontend

Этот README в первую очередь предназначен для backend-разработчика.

Frontend написан на React + TypeScript + Vite.
Backend проекта — C# + ASP.NET Core + Dapper, база — PostgreSQL.

По архитектуре MVC frontend выполняет роль View:
он отображает данные, отправляет запросы и получает JSON от backend.

---

# Запуск

## Для разработки

```bash
npm install
npm run dev
```

Откроется `http://localhost:5173`.

Пока backend не готов, всё работает на моках: `VITE_USE_MOCKS=true` в `.env`.
Моки ведут себя как настоящий сервер (проверяют те же правила) и хранят данные в браузере.
Демо-аккаунт: **anya@example.com / studyhub1** (на странице входа есть кнопка «Подставить»).
Сбросить демо-данные: в консоли браузера `localStorage.clear()` и обновить страницу.

Когда backend запущен — поставьте `VITE_USE_MOCKS=false` и перезапустите `npm run dev`.

## В Docker (п. 2.3)

Frontend собирается и раздаётся через nginx. Запросы `/api/...` nginx передаёт на backend.

```bash
docker build -t studyhub-frontend .
```

Пример сервиса для общего `docker-compose.yml`:

```yaml
frontend:
  build: ./studyhub-frontend
  ports:
    - "8080:80"
  environment:
    BACKEND_URL: http://backend:8080   # имя и порт сервиса backend
  depends_on:
    - backend
```

После `docker compose up` приложение открывается на `http://localhost:8080`.

---

# Быстрая навигация для backend-разработчика

| Что нужно узнать | Где смотреть |
|---|---|
| Как выглядит задача и правила очков / брёвен | `src/types/task.ts` |
| Как выглядит костёр и его пороги | `src/types/campfire.ts` |
| Как выглядит сессия фокуса | `src/types/focus.ts` |
| Как выглядит заметка | `src/types/note.ts` |
| Пользователь, вход, регистрация, аккаунт | `src/types/auth.ts` |
| Как frontend ожидает ошибки | `src/types/api.ts` и `src/services/api.ts` |
| Какие запросы вызывает frontend | `src/services/*Api.ts` |
| Как будет вести себя сервер (эталон правил) | `src/mocks/mockServer.ts` |
| Адрес backend API | `.env` |

---

# Как устроен MVC на frontend

| Слой | Где | Что делает |
|---|---|---|
| **Model** | `src/types/`, `src/services/` | Описывает данные и отправляет запросы к backend |
| **Controller** | `src/features/*/use*.ts`, `src/features/*/*Provider.tsx` | Загружает данные, хранит их и обрабатывает действия пользователя |
| **View** | `src/features/*/*.tsx`, `src/pages/` | Показывает данные и вызывает функции контроллера |

Контроллеры:

| Контроллер | Что делает |
|---|---|
| `features/auth/AuthProvider.tsx` | вход, регистрация, выход, изменение и удаление аккаунта (на всё приложение) |
| `features/tasks/useTasks.ts` | задачи: создать, изменить, выполнить, «не выполнил», удалить |
| `features/campfire/useCampfire.ts` | костёр: запас брёвен, сгорание 1 бревно в час |
| `features/focus/FocusProvider.tsx` | фокус-таймер (живёт на уровне приложения, идёт на любой странице) |
| `features/notes/useNotes.ts` | заметки |
| `features/statistics/useStatistics.ts` | статистика за период |

Логика без React (правила, подсчёты) лежит рядом в `*Utils.ts`:
`taskUtils.ts`, `campfireUtils.ts`, `focusUtils.ts`, `statisticsUtils.ts`, `noteUtils.ts`, `authValidation.ts`.

Модули разделены по папкам `features/*` — новый модуль добавляется без изменения существующих (п. 2.13).

---

# Эндпоинты, которые вызывает frontend

Все запросы, кроме регистрации и входа, отправляются с заголовком
`Authorization: Bearer <токен>`. На ответ `401` frontend выходит на страницу входа.

## Аккаунт

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| POST | `/api/auth/register` | `RegisterRequest` | `AuthResponse` (токен + пользователь) |
| POST | `/api/auth/login` | `LoginRequest` (`method`: `email` / `phone`) | `AuthResponse` |
| GET | `/api/auth/me` | — | `User` — кто вошёл по токену |
| POST | `/api/auth/logout` | — | `204` |
| PUT | `/api/account` | `UpdateAccountRequest` | `User` |
| PUT | `/api/account/password` | `ChangePasswordRequest` | `204` |
| DELETE | `/api/account` | `DeleteAccountRequest` (пароль) | `204` — вместе со всеми данными, в транзакции |

## Задачи

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| GET | `/api/tasks` | — | `Task[]` — все задачи пользователя |
| GET | `/api/tasks?date=YYYY-MM-DD` | — | `Task[]` — задачи на день |
| POST | `/api/tasks` | `CreateTaskRequest` | `Task` |
| PUT | `/api/tasks/{id}` | `UpdateTaskRequest` | `Task` |
| DELETE | `/api/tasks/{id}` | — | `204` |
| POST | `/api/tasks/{id}/complete` | — | `CompleteTaskResponse`: `{ task, campfire, logsAdded }` |
| POST | `/api/tasks/{id}/fail` | — | `Task` со статусом `failed` |

Выполнение задачи и пополнение костра — одна операция в транзакции (п. 2.8).

## Костёр, фокус, заметки

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| GET | `/api/campfire` | — | `Campfire`: `{ logs, updatedAt }` |
| GET | `/api/focus/sessions` | — | `FocusSession[]` |
| POST | `/api/focus/sessions` | `StartFocusRequest` | `FocusSession` (статус `active`); если уже идёт — `409` |
| POST | `/api/focus/sessions/{id}/finish` | `FinishFocusRequest` | `FocusSession` |
| GET | `/api/notes` | — | `Note[]` |
| POST | `/api/notes` | `CreateNoteRequest` | `Note` |
| PUT | `/api/notes/{id}` | `UpdateNoteRequest` | `Note` |
| DELETE | `/api/notes/{id}` | — | `204` |

## Ошибки

Ошибку frontend ждёт в виде JSON `{ "message": "текст для пользователя" }`
(см. `src/types/api.ts`). Текст из `4xx` показывается пользователю как есть, поэтому
он должен быть на русском и без технических кодов, например:

| Статус | Когда | `message` |
|---|---|---|
| 400 | неверный вход | «Неправильные данные для входа» |
| 423 | 5 неудачных входов подряд | «Слишком много попыток, попробуйте через 15 минут» |
| 409 | e-mail / телефон занят | «Этот e-mail уже используется» / «Этот номер уже используется» |
| 400 | неверный текущий пароль | «Неверный пароль» |
| 400 | задача на прошедший день | «Нельзя добавить задачу на прошедший день» |
| 409 | задача уже отмечена | «Задача уже отмечена, изменить её нельзя» |
| 409 | таймер уже идёт | «Сначала остановите текущий таймер» |
| 404 | не найдено | «Задача не найдена или удалена» |

При `5xx` и недоступном сервере frontend показывает общий текст для действия
(«Не удалось создать задачу. Попробуйте позже»).

---

# Правила, которые frontend уже учитывает

- **Очки**: лёгкая — 10, средняя — 20, сложная — 30; только за выполненные задачи, только растут.
- **Брёвна**: лёгкая — 5, средняя — 10, сложная — 15; максимум 100, лишние не добавляются.
- **Костёр** сгорает по 1 бревну в час. Сервер хранит `logs` и `updatedAt` (время последнего изменения),
  текущий запас = `logs − целых часов с updatedAt`, но не меньше 0.
  Состояния: потух — 0, тлеет — 1–29, горит — 30–69, пылает — 70–100.
- **Отмеченную задачу** (выполненную или невыполненную) нельзя изменить, отменить или удалить.
- **Задачу нельзя создать** на прошедший день; название — до 200 символов.
- **Таймер фокуса**: от 1 минуты до 12 часов; считается от времени старта, паузы не входят во время фокуса.
  Если завершение сессии не дошло до сервера, frontend отправит его при следующем подключении.
- **Статистика** считается на frontend из `GET /api/tasks` и `GET /api/focus/sessions`
  (`src/features/statistics/statisticsUtils.ts`).
- **Регистрация**: имя до 50 символов, телефон `+7XXXXXXXXXX`, пароль от 8 символов с буквами и цифрами.
