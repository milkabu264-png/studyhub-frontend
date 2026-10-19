import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import FocusProvider from "../../features/focus/FocusProvider";

import "./AppLayout.css";

//FocusProvider здесь, а не на главной: таймер продолжает идти, даже если уйти в блокнот
export default function AppLayout() {
  return (
    <FocusProvider>
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
    </FocusProvider>
  );
}
