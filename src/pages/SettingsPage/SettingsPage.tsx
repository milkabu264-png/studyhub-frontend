import { useNavigate } from "react-router-dom";

import AccountActions from "../../features/settings/AccountActions";
import PasswordForm from "../../features/settings/PasswordForm";
import ProfileForm from "../../features/settings/ProfileForm";
import useAuth from "../../features/auth/useAuth";
import { getErrorMessage } from "../../services/api";

import "./SettingsPage.css";

// Страница «Настройки» (View).
// Данные и действия берёт из контроллера аккаунта (useAuth).

function SettingsPage() {
  const { user, updateAccount, changePassword, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  //сюда попадают только после входа — RequireAuth не пустит без пользователя
  if (!user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Настройки</h1>
        <p>Данные аккаунта, пароль и выход.</p>
      </div>

      <div className="settings-content">
        <ProfileForm
          user={user}
          onSave={async (data) => {
            try {
              await updateAccount(data);
              return null;
            } catch (e) {
              return getErrorMessage(e, "Не удалось сохранить. Попробуйте позже");
            }
          }}
        />

        <PasswordForm
          onSave={async (data) => {
            try {
              await changePassword(data);
              return null;
            } catch (e) {
              return getErrorMessage(e, "Не удалось сохранить. Попробуйте позже");
            }
          }}
        />

        <AccountActions
          onLogout={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
          onDelete={async (password) => {
            try {
              await deleteAccount(password);
              navigate("/login", { replace: true });
              return null;
            } catch (e) {
              return getErrorMessage(e, "Не удалось удалить аккаунт. Попробуйте позже");
            }
          }}
        />
      </div>
    </div>
  );
}

export default SettingsPage;
