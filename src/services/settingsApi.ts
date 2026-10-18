import { apiRequest } from "./api";

import type {
  Settings,
  UpdateCampfireRequest,
  UpdateProfileRequest,
} from "../types/settings.ts";

export function getSettings() {
  return apiRequest<Settings>(
    "/settings",
  );
}

export function updateProfile(
  data: UpdateProfileRequest,
) {
  return apiRequest<Settings>(
    "/settings/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function updateCampfireSettings(
  data: UpdateCampfireRequest,
) {
  return apiRequest<Settings>(
    "/settings/campfire",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function logout() {
  return apiRequest<void>(
    "/auth/logout",
    {
      method: "POST",
    },
  );
}

export function deleteAccount() {
  return apiRequest<void>(
    "/account",
    {
      method: "DELETE",
    },
  );
}
