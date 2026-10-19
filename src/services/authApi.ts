import { USE_MOCKS, apiRequest } from "./api";
import { mockAuth } from "../mocks/mockServer";

import type {
  AuthResponse,
  ChangePasswordRequest,
  DeleteAccountRequest,
  LoginRequest,
  RegisterRequest,
  UpdateAccountRequest,
  User,
} from "../types/auth.ts";

export function register(
  data: RegisterRequest,
) {
  if (USE_MOCKS) return mockAuth.register(data);

  return apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function login(
  data: LoginRequest,
) {
  if (USE_MOCKS) return mockAuth.login(data);

  return apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

//кто вошёл — по сохранённому токену (при открытии приложения)
export function getCurrentUser() {
  if (USE_MOCKS) return mockAuth.me();

  return apiRequest<User>(
    "/auth/me",
  );
}

export function logout() {
  if (USE_MOCKS) return mockAuth.logout();

  return apiRequest<void>(
    "/auth/logout",
    {
      method: "POST",
    },
  );
}

export function updateAccount(
  data: UpdateAccountRequest,
) {
  if (USE_MOCKS) return mockAuth.updateAccount(data);

  return apiRequest<User>(
    "/account",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function changePassword(
  data: ChangePasswordRequest,
) {
  if (USE_MOCKS) return mockAuth.changePassword(data.currentPassword, data.newPassword);

  return apiRequest<void>(
    "/account/password",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function deleteAccount(
  data: DeleteAccountRequest,
) {
  if (USE_MOCKS) return mockAuth.deleteAccount(data.password);

  return apiRequest<void>(
    "/account",
    {
      method: "DELETE",
      body: JSON.stringify(data),
    },
  );
}
