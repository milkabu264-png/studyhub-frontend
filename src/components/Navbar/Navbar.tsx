import {NavLink} from 'react-router-dom';
import useSettings from "../../features/settings/useSettings";
import "./Navbar.css";

//маленькие линейные иконки для пунктов меню
const ICONS = {
  flame: "M12 3c.5 3 3 4.5 4.5 7a6.5 6.5 0 1 1-11.6 1.5c.6 1 1.6 1.7 2.6 1.9C7 10 9.5 6.5 12 3Z",
  home: "M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5",
  notebook: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M17.5 2.5a2.1 2.1 0 0 1 3 3L12 14l-4 1 1-4Z",
  statistics: "M3 3v18h18M7 15l4-4 3 3 5-6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4Z",
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function Navbar() {
  //имя берём из настроек — после сохранения в «Аккаунте» оно сразу обновится здесь
  const { settings } = useSettings();
  const name = settings.profile.name;

    return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-logo-mark">
          <Icon path={ICONS.flame} />
        </span>
        StudyHub
      </div>

      <nav className="navbar-links">
        {/* end — чтобы «Главная» не подсвечивалась на других страницах */}
        <NavLink to="/" end>
          <Icon path={ICONS.home} />
          Главная
        </NavLink>

        <NavLink to="/notebook">
          <Icon path={ICONS.notebook} />
          Блокнот
        </NavLink>

        <NavLink to="/statistics">
          <Icon path={ICONS.statistics} />
          Статистика
        </NavLink>

        <NavLink to="/settings">
          <Icon path={ICONS.settings} />
          Настройки
        </NavLink>
      </nav>

      {name && (
        <NavLink to="/settings" className="navbar-user" title="Настройки профиля">
          <span className="navbar-user-avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          {name}
        </NavLink>
      )}
    </header>
  );
}
