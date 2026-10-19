export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

//пользователь: имя, e-mail и телефон (оба обязательны)

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type LoginMethod = | "email" | "phone";

export interface LoginRequest {
  method: LoginMethod;
  //e-mail или номер телефона — в зависимости от method
  login: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

//ответ на вход и регистрацию: токен сессии и данные пользователя

export interface UpdateAccountRequest {
  name: string;
  email: string;
  phone: string;
  //нужен, если меняется e-mail или телефон
  currentPassword: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export const NAME_MAX_LENGTH = 50;
