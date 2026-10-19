import { createContext } from "react";

export type ToastKind = | "success" | "error" | "info";

//показать короткое сообщение внизу экрана: «Задача удалена», «Изменения сохранены»…
export type ShowToast = (message: string, kind?: ToastKind) => void;

export const ToastContext = createContext<ShowToast | null>(null);
