import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../../features/auth/useAuth";

//защита страниц: без входа — на страницу входа (п. 2.5)
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <div className="auth-loading">Загружаем…</div>;
  }

  if (status === "guest") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

//страницы входа и регистрации: если уже вошли — на главную
export function GuestOnly() {
  const { status } = useAuth();

  if (status === "loading") {
    return <div className="auth-loading">Загружаем…</div>;
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
