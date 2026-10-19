import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/AppLayout/AppLayout.tsx";
import { GuestOnly, RequireAuth } from "../components/RequireAuth/RequireAuth.tsx";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import NotebookPage from "../pages/NotebookPage/NotebookPage";
import StatisticsPage from "../pages/StatisticsPage/StatisticsPage";
import SettingsPage from "../pages/SettingsPage/SettingsPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* вход и регистрация — только для тех, кто ещё не вошёл */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* остальное — только после входа */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/notebook" element={<NotebookPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
