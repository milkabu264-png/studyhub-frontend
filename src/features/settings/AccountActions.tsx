import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./settings.css";
import "./AccountActions.css";

interface AccountActionsProps {
  onLogout: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}

//слово, которое нужно ввести, чтобы удалить аккаунт, — защита от случайного клика
const CONFIRM_WORD = "удалить";

//раздел с выходом и удалением аккаунта

export default function AccountActions({ onLogout, onDelete }: AccountActionsProps) {
  const navigate = useNavigate();

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleLogout() {
    setIsBusy(true);
    const ok = await onLogout();
    setIsBusy(false);

    if (ok) {
      navigate("/login");
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    const ok = await onDelete();
    setIsBusy(false);

    if (ok) {
      navigate("/register");
    }
  }

  function cancelDelete() {
    setIsConfirming(false);
    setConfirmText("");
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

        {!isConfirming && (
          <button
            type="button"
            className="account-delete-button"
            onClick={() => setIsConfirming(true)}
          >
            Удалить аккаунт
          </button>
        )}
      </div>

      {/* подтверждение удаления — прямо на странице, без всплывающих окон */}
      {isConfirming && (
        <div className="account-confirm" role="alertdialog" aria-labelledby="delete-title">
          <strong id="delete-title">Удалить аккаунт насовсем?</strong>

          <p>
            Задачи, заметки и статистика удалятся без возможности восстановления.
            Чтобы подтвердить, введите слово «{CONFIRM_WORD}».
          </p>

          <input
            id="deleteConfirm"
            type="text"
            autoFocus
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            aria-label={`Введите «${CONFIRM_WORD}»`}
          />

          <div className="settings-actions">
            <button
              type="button"
              className="account-delete-confirm"
              disabled={confirmText.trim().toLowerCase() !== CONFIRM_WORD || isBusy}
              onClick={() => void handleDelete()}
            >
              Удалить навсегда
            </button>

            <button
              type="button"
              className="settings-button settings-button-secondary"
              onClick={cancelDelete}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
