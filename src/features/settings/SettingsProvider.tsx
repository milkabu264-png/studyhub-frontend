import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  deleteAccount as deleteAccountRequest,
  getSettings,
  logout as logoutRequest,
  updateCampfireSettings,
  updateProfile,
} from "../../services/settingsApi";
import { USE_MOCKS } from "../../services/api";
import { mockSettings } from "../../mocks/settings";
import { SettingsContext } from "./SettingsContext";

import type {
  CampfireThresholds,
  Settings,
  UserProfile,
} from "../../types/settings";
import { DEFAULT_CAMPFIRE_THRESHOLDS } from "../../types/settings";

// CONTROLLER настроек (C в MVC).
//
// Настройки нужны сразу нескольким местам: странице «Настройки», костру на главной
// и шапке с именем. Поэтому контроллер один на всё приложение и раздаётся через Context.

//на моках настройки сохраняются в браузере, чтобы не пропадали после перезагрузки
const STORAGE_KEY = "studyhub-settings";

function readStoredSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Settings) : mockSettings;
  } catch {
    return mockSettings;
  }
}

function storeSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    //хранилище недоступно (например, приватное окно) — просто не сохраняем
  }
}

const EMPTY_SETTINGS: Settings = {
  profile: { name: "", email: "" },
  campfire: { ...DEFAULT_CAMPFIRE_THRESHOLDS },
};

interface SettingsProviderProps {
  children: ReactNode;
}

export default function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);

    try {
      setSettings(USE_MOCKS ? readStoredSettings() : await getSettings());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  //сохранить новые настройки: на моках — в браузер, иначе — ответ сервера
  async function apply(next: Settings, request: () => Promise<Settings>): Promise<boolean> {
    setError(null);

    try {
      if (USE_MOCKS) {
        storeSettings(next);
        setSettings(next);
      } else {
        setSettings(await request());
      }

      return true;
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  }

  function saveProfile(profile: UserProfile) {
    return apply({ ...settings, profile }, () => updateProfile(profile));
  }

  function saveCampfire(thresholds: CampfireThresholds) {
    return apply({ ...settings, campfire: thresholds }, () =>
      updateCampfireSettings(thresholds),
    );
  }

  async function logout(): Promise<boolean> {
    try {
      if (!USE_MOCKS) {
        await logoutRequest();
      }

      return true;
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  }

  async function deleteAccount(): Promise<boolean> {
    try {
      if (USE_MOCKS) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          //нечего удалять
        }
      } else {
        await deleteAccountRequest();
      }

      setSettings(EMPTY_SETTINGS);
      return true;
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        clearError: () => setError(null),
        saveProfile,
        saveCampfire,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером";
  }

  return error instanceof Error ? error.message : "Что-то пошло не так";
}
