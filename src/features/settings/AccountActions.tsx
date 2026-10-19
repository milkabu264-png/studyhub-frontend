import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

import "./settings.css";
import "./AccountActions.css";

interface AccountActionsProps {
  onLogout: () => Promise<void>;
  //возвращает текст ошибки (например, «Неверный пароль») или null, если аккаунт удалён
  onDelete: (password: string) => Promise<string | null>;
}

//раздел с выходом и удалением аккаунта (п. 1.1.3, 1.1.5)

export default function AccountActions({ onLogout, onDelete }: AccountActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleLogout() {
    setIsBusy(true);
    await onLogout();
  }

  async function handleDelete() {
    setIsBusy(true);
    const error = await onDelete(password);
    setIsBusy(false);

    if (error) {
      setDeleteError(error);
    }
  }

  function closeDelete() {
    setIsDeleteOpen(false);
    setPassword("");
    setDeleteError(null);
  }

  return (
    <section className="settings-section">
      <h2>Выход и удаление</h2>

      <div className="settings-actions">
        <button
          type="button"
          className="settings-button settings-button-secondary"
          disabled={isBusy}
          onClick={() => void handleLogout()}
        >
          Выйти
        </button>

        <button
          type="button"
          className="account-delete-button"
          onClick={() => setIsDeleteOpen(true)}
        >
          Удалить аккаунт
        </button>
      </div>

      {/* удаление подтверждается паролем в диалоге */}
      {isDeleteOpen && (
        <ConfirmDialog
          title="Удалить аккаунт насовсем?"
          text="Задачи, сессии фокуса, записи и статистика удалятся без возможности восстановления."
          confirmText={isBusy ? "Удаляем…" : "Удалить навсегда"}
          danger
          confirmDisabled={!password || isBusy}
          onConfirm={() => void handleDelete()}
          onCancel={closeDelete}
        >
          <label className="settings-field">
            Пароль

            <input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setDeleteError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && password && !isBusy) {
                  void handleDelete();
                }
              }}
            />
          </label>

          {deleteError && <p className="confirm-error" role="alert">{deleteError}</p>}
        </ConfirmDialog>
      )}
    </section>
  );
}
