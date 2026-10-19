import { createContext } from "react";

import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateAccountRequest,
  User,
} from "../../types/auth";

//loading — проверяем сохранённый токен; guest — не вошёл; authenticated — вошёл
export type AuthStatus = | "loading" | "guest" | "authenticated";

//что контроллер аккаунта отдаёт компонентам.
//Методы бросают ApiRequestError — форма сама показывает текст ошибки рядом с полями.
export interface AuthController {
  user: User | null;
  status: AuthStatus;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;

  updateAccount: (data: UpdateAccountRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthController | null>(null);
