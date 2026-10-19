import { NAME_MAX_LENGTH } from "../../types/auth";

// Правила полей аккаунта (п. 1.1) — без React. Тексты ошибок — из требований.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+7\d{10}$/;

export const PASSWORD_MIN_LENGTH = 8;

//null — поле в порядке
export function validateName(name: string): string | null {
  if (!name.trim()) return "Введите имя";
  if (name.trim().length > NAME_MAX_LENGTH) return "Имя слишком длинное";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Введите e-mail";
  if (!EMAIL_PATTERN.test(email.trim())) return "Укажите корректный e-mail";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Введите номер телефона";
  if (!PHONE_PATTERN.test(normalizePhone(phone))) return "Укажите номер в формате +7XXXXXXXXXX";
  return null;
}

//минимум 8 символов, есть и буквы, и цифры
export function validatePassword(password: string): string | null {
  const hasLetter = /\p{L}/u.test(password);
  const hasDigit = /\d/.test(password);

  if (password.length < PASSWORD_MIN_LENGTH || !hasLetter || !hasDigit) {
    return "Пароль должен содержать минимум 8 символов, буквы и цифры";
  }

  return null;
}

//убираем пробелы, скобки и дефисы, 8XXXXXXXXXX превращаем в +7XXXXXXXXXX
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");

  if (/^8\d{10}$/.test(digits)) {
    return `+7${digits.slice(1)}`;
  }

  return digits;
}

//собрать ошибки формы в объект { поле: текст }; пустой объект — всё верно
export function collectErrors<T extends string>(
  checks: Record<T, string | null>,
): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {};

  for (const key of Object.keys(checks) as T[]) {
    const error = checks[key];

    if (error) {
      errors[key] = error;
    }
  }

  return errors;
}
