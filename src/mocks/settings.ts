import type { Settings } from "../types/settings.ts";
import { DEFAULT_CAMPFIRE_THRESHOLDS } from "../types/settings.ts";

//настройки-заглушка, пока нет backend
export const mockSettings: Settings = {
  profile: {
    name: "Аня",
    email: "anya@example.com",
  },

  campfire: { ...DEFAULT_CAMPFIRE_THRESHOLDS },
};
