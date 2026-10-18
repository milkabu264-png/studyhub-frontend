export interface UserProfile {
  name: string;
  email: string;
}

//данные пользователя из раздела «Аккаунт»

export interface CampfireThresholds {
  low: number;
  burning: number;
  blazing: number;
}

//сколько задач нужно сжечь за день, чтобы костёр «горел слабо», «горел» и «пылал»

export interface Settings {
  profile: UserProfile;
  campfire: CampfireThresholds;
}

//все настройки пользователя целиком — так их отдаёт GET /settings

export type UpdateProfileRequest = UserProfile;

export type UpdateCampfireRequest = CampfireThresholds;

export const DEFAULT_CAMPFIRE_THRESHOLDS: CampfireThresholds = {
  low: 1,
  burning: 3,
  blazing: 5,
};

//значения по умолчанию — к ним возвращает кнопка «Сбросить по умолчанию»
