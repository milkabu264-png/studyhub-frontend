# StudyHub Frontend

Frontend-часть веб-приложения StudyHub.

## Стек

- React 18
- TypeScript
- Vite
- React Router
- CSS
- HTML5 Drag & Drop API

Backend:
- C#
- ASP.NET Core
- Dapper

Database:
- PostgreSQL
- Flyway

---

# Архитектура

Проект строится по MVC.

В общей архитектуре приложения:

- Model — backend на C#
- Controller — ASP.NET Core Controllers
- View — React frontend

Frontend не обращается к PostgreSQL напрямую.

Схема взаимодействия:

React
↓
REST API
↓
ASP.NET Core
↓
Dapper
↓
PostgreSQL

---

# Запуск frontend

Установить зависимости:

```bash
npm install
