import type { CampfireThresholds, UserProfile } from "../../types/settings";

// Проверка полей перед сохранением — без React, только правила.

export const NAME_MAX_LENGTH = 50;

//самый частый случай ошибки — пропущенная @ или точка в домене
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ProfileErrors = Partial<Record<keyof UserProfile, string>>;

export function validateProfile(profile: UserProfile): ProfileErrors {
  const errors: ProfileErrors = {};

  if (!profile.name.trim()) {
    errors.name = "Введите имя";
  } else if (profile.name.trim().length > NAME_MAX_LENGTH) {
    errors.name = `Не длиннее ${NAME_MAX_LENGTH} символов`;
  }

  if (!EMAIL_PATTERN.test(profile.email.trim())) {
    errors.email = "Проверьте адрес: например, anya@example.com";
  }

  return errors;
}

export type ThresholdErrors = Partial<Record<keyof CampfireThresholds, string>>;

//каждый порог — целое число от 1, и каждый следующий больше предыдущего
export function validateThresholds(thresholds: CampfireThresholds): ThresholdErrors {
  const errors: ThresholdErrors = {};

  for (const key of ["low", "burning", "blazing"] as const) {
    const value = thresholds[key];

    if (!Number.isInteger(value) || value < 1) {
      errors[key] = "Целое число от 1";
    }
  }

  if (!errors.burning && !errors.low && thresholds.burning <= thresholds.low) {
    errors.burning = "Должно быть больше, чем «Горит слабо»";
  }

  if (!errors.blazing && !errors.burning && thresholds.blazing <= thresholds.burning) {
    errors.blazing = "Должно быть больше, чем «Горит»";
  }

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
