import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import "./ConfirmDialog.css";

export interface ConfirmDialogProps {
  title: string;
  text?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  //красная кнопка — для необратимых действий
  danger?: boolean;
  //кнопка подтверждения недоступна (например, пока не введён пароль)
  confirmDisabled?: boolean;
  //дополнительное содержимое: поле пароля, ошибка
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

//окно подтверждения внутри страницы (вместо window.confirm):
//все необратимые действия спрашивают «Вы точно…?» (п. 2.10)

export default function ConfirmDialog({
  title,
  text,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  //фокус на «Отмене» — случайный Enter ничего не удалит; Esc закрывает окно
  useEffect(() => {
    if (!children) {
      cancelRef.current?.focus();
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel, children]);

  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>

        {text && <div className="confirm-text">{text}</div>}

        {children}

        <div className="confirm-actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={danger ? "confirm-ok confirm-ok-danger" : "confirm-ok"}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
