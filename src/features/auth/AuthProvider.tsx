import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import * as authApi from "../../services/authApi";
import { SESSION_EXPIRED_EVENT, getToken, setToken } from "../../services/api";
import { AuthContext } from "./AuthContext";
import { writeTimer } from "../focus/focusUtils";
import type { AuthStatus } from "./AuthContext";

import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateAccountRequest,
  User,
} from "../../types/auth";

// CONTROLLER аккаунта (C в MVC).
//
// Хранит, кто вошёл, и умеет входить, регистрироваться, выходить, менять данные и удалять аккаунт.
// Нужен всему приложению (защита страниц, имя в шапке, настройки), поэтому раздаётся через Context.

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(getToken() ? "loading" : "guest");

  //при открытии приложения проверяем сохранённый токен
  useEffect(() => {
    if (!getToken()) {
      return;
    }

    authApi
      .getCurrentUser()
      .then((current) => {
        setUser(current);
        setStatus("authenticated");
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        setStatus("guest");
      });
  }, []);

  //сервер ответил 401 на любом запросе — сессия закончилась, выходим
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setStatus("guest");
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  function signIn(token: string, signedInUser: User) {
    setToken(token);
    setUser(signedInUser);
    setStatus("authenticated");
  }

  function signOut() {
    //незавершённый таймер фокуса принадлежит этому пользователю — убираем его
    writeTimer(null);
    setToken(null);
    setUser(null);
    setStatus("guest");
  }

  async function login(data: LoginRequest) {
    const response = await authApi.login(data);
    signIn(response.token, response.user);
  }

  //после регистрации пользователь сразу входит (п. 1.1.1)
  async function register(data: RegisterRequest) {
    const response = await authApi.register(data);
    signIn(response.token, response.user);
  }

  //даже если сервер не ответил, сессия на клиенте всё равно очищается (п. 1.1.3)
  async function logout() {
    try {
      await authApi.logout();
    } catch {
      //не важно — выходим всё равно
    } finally {
      signOut();
    }
  }

  async function updateAccount(data: UpdateAccountRequest) {
    setUser(await authApi.updateAccount(data));
  }

  async function changePassword(data: ChangePasswordRequest) {
    await authApi.changePassword(data);
  }

  async function deleteAccount(password: string) {
    await authApi.deleteAccount({ password });
    signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        register,
        logout,
        updateAccount,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
