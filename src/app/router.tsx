import { Route, Routes } from "react-router-dom";

import AppLayout from "../components/AppLayout/AppLayout.tsx";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import NotebookPage from "../pages/NotebookPage/NotebookPage";
import StatisticsPage from "../pages/StatisticsPage/StatisticsPage";
import SettingsPage from "../pages/SettingsPage/SettingsPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/notebook" element={<NotebookPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}