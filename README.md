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
| Какие запросы задач вызывает frontend | `src/services/tasksApi.ts` |
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
│   ├── tasksApi.ts
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
