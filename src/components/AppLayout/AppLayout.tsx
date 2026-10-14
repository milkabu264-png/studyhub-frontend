import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>Не нужно успеть всё. Достаточно сделать важное.</span>
        <span>StudyHub · Ваш спокойный ритм</span>
      </footer>
    </div>
  );
}
