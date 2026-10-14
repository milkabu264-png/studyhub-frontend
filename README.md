# StudyHub Frontend

Этот README в первую очередь предназначен для backend-разработчика.

Frontend написан на React + TypeScript + Vite.
Backend проекта — C# + ASP.NET Core.

По архитектуре MVC frontend выполняет роль View:
он отображает данные, отправляет запросы и получает JSON от backend.

---

# Быстрая навигация для backend-разработчика

Если нужно понять:

| Что нужно узнать | Где смотреть |
|---|---|
| Как выглядит объект задачи | `src/types/task.ts` |
| Какие данные frontend отправляет при создании задачи | `src/types/task.ts` → `CreateTaskRequest` |
| Какие данные frontend отправляет при изменении задачи | `src/types/task.ts` → `UpdateTaskRequest` |
| Как выглядит состояние костра | `src/types/campfire.ts` |
| Как frontend ожидает ошибки | `src/types/api.ts` |
| Какие запросы задач вызывает frontend | `src/services/taskApi.ts` |
| Как frontend получает состояние костра | `src/services/campfireApi.ts` |
| Как устроен общий запрос к backend | `src/services/api.ts` |
| Какие данные используются до подключения backend | `src/mocks/` |
| Как эти данные используются интерфейсом | `src/features/` и `src/pages/` |
| Адрес backend API | `.env` |

---

# Структура frontend

Основные папки, которые могут понадобиться backend-разработчику:

```text
src/
│
├── types/
│   ├── api.ts
│   ├── task.ts
│   └── campfire.ts
│
├── services/
│   ├── api.ts
│   ├── taskApi.ts
│   └── campfireApi.ts
│
├── mocks/
│   └── tasks.ts
│
├── features/
│
├── pages/
│
└── app/
```

---

# Как устроен MVC на frontend

| Слой | Где | Что делает |
|---|---|---|
| **Model** | `src/types/`, `src/services/` | Описывает данные и отправляет запросы к backend |
| **Controller** | `src/features/tasks/useTasks.ts` | Загружает задачи, хранит их и обрабатывает действия пользователя |
| **View** | `src/features/*/*.tsx`, `src/pages/` | Показывает данные и вызывает функции контроллера |

Логика без React (вкладки, прогресс, подписи дат, уровень костра) лежит отдельно:
`src/features/tasks/taskUtils.ts` и `src/features/campfire/campfireUtils.ts`.

---

# Эндпоинты, которые вызывает frontend

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| GET | `/api/tasks` | — | `Task[]` — все задачи пользователя |
| GET | `/api/tasks?date=YYYY-MM-DD` | — | `Task[]` — задачи на день |
| POST | `/api/tasks` | `CreateTaskRequest` | `Task` |
| PUT | `/api/tasks/{id}` | `UpdateTaskRequest` | `Task` |
| DELETE | `/api/tasks/{id}` | — | `204` |
| POST | `/api/tasks/{id}/complete` | — | `Task` со статусом `completed` |
| POST | `/api/tasks/{id}/restore` | — | `Task` со статусом `active` |
| POST | `/api/tasks/{id}/fail` | — | `Task` со статусом `failed` |
| GET | `/api/campfire` | — | `Campfire` |

Ошибки frontend ждёт в виде JSON с полем `message` (см. `src/types/api.ts`).

---

# Запуск

```bash
npm install
npm run dev
```

Пока backend не готов, всё работает на моках: `VITE_USE_MOCKS=true` в `.env`.
Когда backend запущен — поставьте `VITE_USE_MOCKS=false` и перезапустите `npm run dev`.
