import {NavLink} from 'react-router-dom';
import "./Navbar.css";

export default function Navbar() {
    return (
    <header className="navbar">
      <div className="navbar-logo">
        StudyHub
      </div>

      <nav className="navbar-links">
        <NavLink to="/">
          Главная
        </NavLink>

        <NavLink to="/notebook">
          Блокнот
        </NavLink>

        <NavLink to="/statistics">
          Статистика
        </NavLink>

        <NavLink to="/settings">
          Настройки
        </NavLink>
      </nav>
    </header>
  );
}
