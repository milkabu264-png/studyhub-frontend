import AppRouter from "./router";
import SettingsProvider from "../features/settings/SettingsProvider";

//SettingsProvider снаружи — настройки доступны на всех страницах
function App() {
  return (
    <SettingsProvider>
      <AppRouter />
    </SettingsProvider>
  );
}

export default App;
