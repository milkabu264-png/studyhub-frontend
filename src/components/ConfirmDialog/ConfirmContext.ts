import { createContext } from "react";

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  danger?: boolean;
}

//confirm(...) открывает окно и ждёт ответа: true — подтвердили, false — отменили
export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFunction | null>(null);
