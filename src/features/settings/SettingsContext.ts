import { createContext } from "react";

import type {
  CampfireThresholds,
  Settings,
  UserProfile,
} from "../../types/settings";

//что контроллер настроек отдаёт компонентам
export interface SettingsController {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;

  //возвращают true, если сохранилось, — форма покажет «Сохранено»
  saveProfile: (profile: UserProfile) => Promise<boolean>;
  saveCampfire: (thresholds: CampfireThresholds) => Promise<boolean>;

  logout: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

//null — значит компонент оказался вне SettingsProvider
export const SettingsContext = createContext<SettingsController | null>(null);
