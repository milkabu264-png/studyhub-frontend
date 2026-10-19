import { ApiRequestError, getToken } from "../services/api";
import { addLogs } from "../features/campfire/campfireUtils";
import { createSeedTasks } from "./tasks";
import { createSeedNotes } from "./notes";
import { createSeedFocusSessions } from "./focusSessions";

import type { AuthResponse, LoginRequest, RegisterRequest, UpdateAccountRequest, User } from "../types/auth";
import type { Campfire } from "../types/campfire";
import type { FinishFocusRequest, FocusSession, StartFocusRequest } from "../types/focus";
import type { CreateNoteRequest, Note, UpdateNoteRequest } from "../types/note";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "../types/task";
import { LOGS_BY_DIFFICULTY } from "../types/task";
import type { CompleteTaskResponse } from "../services/taskApi";

// Mock-сервер: ведёт себя как будущий backend, но живёт в браузере.
//
// Данные лежат в localStorage, поэтому главная, статистика и блокнот видят одни и те же задачи,
// а после перезагрузки ничего не пропадает. Здесь же проверяются те же правила, что будут
// на сервере: нельзя изменить отмеченную задачу, 5 неудачных входов подряд и т.д.
// Работает, только пока VITE_USE_MOCKS=true.

interface MockUser extends User {
  password: string;
}

interface UserData {
  tasks: Task[];
  notes: Note[];
  campfire: Campfire;
  focusSessions: FocusSession[];
}

interface LoginAttempts {
  fails: number;
  lockedUntil: number | null;
}

interface MockDb {
  version: 2;
  nextId: number;
  users: MockUser[];
  tokens: Record<string, number>;
  data: Record<number, UserData>;
  loginAttempts: Record<string, LoginAttempts>;
}

const STORAGE_KEY = "studyhub-mock-db";
const DELAY_MS = 200;
const MAX_LOGIN_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

//демо-пользователь, чтобы можно было сразу войти и посмотреть приложение
export const DEMO_USER = {
  email: "anya@example.com",
  phone: "+79991234567",
  password: "studyhub1",
};

function createDb(): MockDb {
  return {
    version: 2,
    nextId: 5000,
    users: [{ id: 1, name: "Аня", email: DEMO_USER.email, phone: DEMO_USER.phone, password: DEMO_USER.password }],
    tokens: {},
    data: {
      1: {
        tasks: createSeedTasks(),
        notes: createSeedNotes(),
        //демо-костёр горит: 42 бревна, последнее подкинули 20 минут назад
        campfire: { logs: 42, updatedAt: new Date(Date.now() - 20 * 60_000).toISOString() },
        focusSessions: createSeedFocusSessions(),
      },
    },
    loginAttempts: {},
  };
}

let db: MockDb = load();

function load(): MockDb {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as MockDb;

      if (parsed.version === 2) {
        return parsed;
      }
    }
  } catch {
    //повреждённые или недоступные данные — начинаем заново
  }

  return createDb();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    //хранилище недоступно — данные проживут до перезагрузки
  }
}

//имитация сети: ответ приходит с небольшой задержкой
function respond<T>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = fn();
        save();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, DELAY_MS);
  });
}

function fail(status: number, message: string): never {
  throw new ApiRequestError(status, message);
}

function nextId(): number {
  db.nextId += 1;
  return db.nextId;
}

function toUser({ password: _password, ...user }: MockUser): User {
  return user;
}

//текущий пользователь по токену — как [Authorize] на сервере
function currentUser(): MockUser {
  const token = getToken();
  const userId = token ? db.tokens[token] : undefined;
  const user = db.users.find((item) => item.id === userId);

  if (!user) {
    fail(401, "Войдите в аккаунт");
  }

  return user;
}

function currentData(): UserData {
  return db.data[currentUser().id];
}

function createToken(userId: number): string {
  const token = `mock-${userId}-${Math.random().toString(36).slice(2)}`;
  db.tokens[token] = userId;
  return token;
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// ---------- аккаунт ----------

export const mockAuth = {
  register(data: RegisterRequest): Promise<AuthResponse> {
    return respond(() => {
      if (db.users.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) {
        fail(409, "Этот e-mail уже используется");
      }

      if (db.users.some((user) => user.phone === data.phone)) {
        fail(409, "Этот номер уже используется");
      }

      const user: MockUser = { id: nextId(), ...data };
      db.users.push(user);

      //новый пользователь начинает с потухшего костра и пустых списков
      db.data[user.id] = {
        tasks: [],
        notes: [],
        campfire: { logs: 0, updatedAt: new Date().toISOString() },
        focusSessions: [],
      };

      return { token: createToken(user.id), user: toUser(user) };
    });
  },

  login({ method, login, password }: LoginRequest): Promise<AuthResponse> {
    return respond(() => {
      const key = login.trim().toLowerCase();
      const attempts = db.loginAttempts[key] ?? { fails: 0, lockedUntil: null };

      if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
        fail(423, "Слишком много попыток, попробуйте через 15 минут");
      }

      const user = db.users.find((item) =>
        method === "email" ? item.email.toLowerCase() === key : item.phone === login.trim(),
      );

      if (!user || user.password !== password) {
        attempts.fails += 1;
        attempts.lockedUntil = attempts.fails >= MAX_LOGIN_FAILS ? Date.now() + LOCK_MS : null;

        if (attempts.lockedUntil) {
          attempts.fails = 0;
        }

        db.loginAttempts[key] = attempts;
        save();

        fail(
          attempts.lockedUntil ? 423 : 400,
          attempts.lockedUntil
            ? "Слишком много попыток, попробуйте через 15 минут"
            : "Неправильные данные для входа",
        );
      }

      delete db.loginAttempts[key];
      return { token: createToken(user.id), user: toUser(user) };
    });
  },

  me(): Promise<User> {
    return respond(() => toUser(currentUser()));
  },

  logout(): Promise<void> {
    return respond(() => {
      const token = getToken();

      if (token) {
        delete db.tokens[token];
      }
    });
  },

  updateAccount(data: UpdateAccountRequest): Promise<User> {
    return respond(() => {
      const user = currentUser();
      const contactChanged = data.email !== user.email || data.phone !== user.phone;

      if (contactChanged && data.currentPassword !== user.password) {
        fail(400, "Неверный пароль");
      }

      if (db.users.some((item) => item.id !== user.id && item.email.toLowerCase() === data.email.toLowerCase())) {
        fail(409, "Этот e-mail уже используется");
      }

      if (db.users.some((item) => item.id !== user.id && item.phone === data.phone)) {
        fail(409, "Этот номер уже используется");
      }

      user.name = data.name;
      user.email = data.email;
      user.phone = data.phone;

      return toUser(user);
    });
  },

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return respond(() => {
      const user = currentUser();

      if (user.password !== currentPassword) {
        fail(400, "Неверный пароль");
      }

      user.password = newPassword;
    });
  },

  deleteAccount(password: string): Promise<void> {
    return respond(() => {
      const user = currentUser();

      if (user.password !== password) {
        fail(400, "Неверный пароль");
      }

      //аккаунт удаляется вместе со всеми данными (на сервере — в одной транзакции)
      db.users = db.users.filter((item) => item.id !== user.id);
      delete db.data[user.id];

      for (const [token, userId] of Object.entries(db.tokens)) {
        if (userId === user.id) {
          delete db.tokens[token];
        }
      }
    });
  },
};

// ---------- задачи ----------

function findTask(id: number): Task {
  const task = currentData().tasks.find((item) => item.id === id);

  if (!task) {
    fail(404, "Задача не найдена или удалена");
  }

  return task;
}

function requireActive(task: Task, message: string) {
  if (task.status !== "active") {
    fail(409, message);
  }
}

export const mockTasks = {
  getAll(date?: string): Promise<Task[]> {
    return respond(() => {
      const tasks = currentData().tasks;
      return date ? tasks.filter((task) => task.date === date) : [...tasks];
    });
  },

  create(data: CreateTaskRequest): Promise<Task> {
    return respond(() => {
      if (data.date < todayKey()) {
        fail(400, "Нельзя добавить задачу на прошедший день");
      }

      const task: Task = {
        id: nextId(),
        ...data,
        status: "active",
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      currentData().tasks.push(task);
      return task;
    });
  },

  update(id: number, data: UpdateTaskRequest): Promise<Task> {
    return respond(() => {
      const task = findTask(id);
      requireActive(task, "Отмеченную задачу нельзя изменить");

      if (data.date !== task.date && data.date < todayKey()) {
        fail(400, "Нельзя перенести задачу на прошедший день");
      }

      Object.assign(task, data);
      return { ...task };
    });
  },

  remove(id: number): Promise<void> {
    return respond(() => {
      const data = currentData();
      const task = data.tasks.find((item) => item.id === id);

      if (!task) {
        fail(404, "Задача уже удалена");
      }

      requireActive(task, "Отмеченную задачу удалить нельзя");
      data.tasks = data.tasks.filter((item) => item.id !== id);
    });
  },

  //выполнение задачи и пополнение костра — одна операция (на сервере — транзакция, п. 2.8)
  complete(id: number): Promise<CompleteTaskResponse> {
    return respond(() => {
      const data = currentData();
      const task = findTask(id);
      requireActive(task, "Задача уже отмечена, изменить её нельзя");

      const now = new Date();
      task.status = "completed";
      task.completedAt = now.toISOString();

      const result = addLogs(data.campfire, LOGS_BY_DIFFICULTY[task.difficulty], now);
      data.campfire = result.campfire;

      return { task: { ...task }, campfire: { ...data.campfire }, logsAdded: result.added };
    });
  },

  fail(id: number): Promise<Task> {
    return respond(() => {
      const task = findTask(id);
      requireActive(task, "Задача уже отмечена, изменить её нельзя");

      task.status = "failed";
      task.completedAt = new Date().toISOString();

      return { ...task };
    });
  },
};

// ---------- костёр ----------

export const mockCampfire = {
  get(): Promise<Campfire> {
    return respond(() => ({ ...currentData().campfire }));
  },
};

// ---------- заметки ----------

function findNote(id: number, message = "Запись не найдена или удалена"): Note {
  const note = currentData().notes.find((item) => item.id === id);

  if (!note) {
    fail(404, message);
  }

  return note;
}

export const mockNotes = {
  getAll(): Promise<Note[]> {
    return respond(() => [...currentData().notes]);
  },

  create(data: CreateNoteRequest): Promise<Note> {
    return respond(() => {
      const now = new Date().toISOString();
      const note: Note = { id: nextId(), ...data, isPinned: false, createdAt: now, updatedAt: now };

      currentData().notes.unshift(note);
      return note;
    });
  },

  update(id: number, data: UpdateNoteRequest): Promise<Note> {
    return respond(() => {
      const note = findNote(id);
      Object.assign(note, data, { updatedAt: new Date().toISOString() });
      return { ...note };
    });
  },

  remove(id: number): Promise<void> {
    return respond(() => {
      findNote(id, "Запись уже удалена");
      const data = currentData();
      data.notes = data.notes.filter((note) => note.id !== id);
    });
  },
};

// ---------- фокус ----------

export const mockFocus = {
  getAll(): Promise<FocusSession[]> {
    return respond(() => [...currentData().focusSessions]);
  },

  start({ plannedSeconds }: StartFocusRequest): Promise<FocusSession> {
    return respond(() => {
      const data = currentData();

      //сессия, у которой время давно вышло, а завершение не дошло, — считаем завершённой
      for (const session of data.focusSessions) {
        const endsAt = new Date(session.startedAt).getTime() + session.plannedSeconds * 1000;

        if (session.status === "active" && endsAt < Date.now()) {
          session.status = "completed";
          session.focusedSeconds = session.plannedSeconds;
          session.endedAt = new Date(endsAt).toISOString();
        }
      }

      if (data.focusSessions.some((session) => session.status === "active")) {
        fail(409, "Сначала остановите текущий таймер");
      }

      const session: FocusSession = {
        id: nextId(),
        plannedSeconds,
        focusedSeconds: 0,
        status: "active",
        startedAt: new Date().toISOString(),
        endedAt: null,
      };

      data.focusSessions.push(session);
      return { ...session };
    });
  },

  finish(id: number, { status, focusedSeconds }: FinishFocusRequest): Promise<FocusSession> {
    return respond(() => {
      const session = currentData().focusSessions.find((item) => item.id === id);

      if (!session) {
        fail(404, "Сессия не найдена");
      }

      session.status = status;
      session.focusedSeconds = Math.min(focusedSeconds, session.plannedSeconds);
      session.endedAt = new Date().toISOString();

      return { ...session };
    });
  },
};

//сбросить демо-данные (используется кнопкой в README / при отладке)
export function resetMockDb() {
  db = createDb();
  save();
}
