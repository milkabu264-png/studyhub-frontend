import { Route, Routes } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage.tsx";
import LoginPage from "../pages/LoginPage/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage/RegisterPage.tsx";
import NotebookPage from "../pages/NotebookPage/NotebookPage.tsx";
import StatisticsPage from "../pages/StatisticsPage/StatisticsPage.tsx";
import SettingsPage from "../pages/SettingsPage/SettingsPage.tsx";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notebook" element={<NotebookPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default AppRouter;