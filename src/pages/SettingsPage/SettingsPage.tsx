import AccountActions from "../../features/settings/AccountActions";
import CampfireSettingsForm from "../../features/settings/CampfireSettingsForm";
import ProfileForm from "../../features/settings/ProfileForm";
import useSettings from "../../features/settings/useSettings";

import "./SettingsPage.css";

// Страница «Настройки» (View).
// Данные и действия берёт из контроллера настроек (useSettings).

function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    clearError,
    saveProfile,
    saveCampfire,
    logout,
    deleteAccount,
  } = useSettings();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Настройки</h1>
        <p>Профиль, правила костра и аккаунт.</p>
      </div>

      {error && (
        <div className="settings-page-error" role="alert">
          <span>{error}</span>

          <button type="button" aria-label="Скрыть ошибку" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="settings-skeleton" />
      ) : (
        <div className="settings-content">
          {/* формы появляются, когда настройки уже загружены, — поля сразу заполнены */}
          <ProfileForm
            profile={settings.profile}
            onSave={saveProfile}
          />

          <CampfireSettingsForm
            thresholds={settings.campfire}
            onSave={saveCampfire}
          />

          <AccountActions onLogout={logout} onDelete={deleteAccount} />
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
