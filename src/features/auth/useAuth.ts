import { useContext } from "react";

import { AuthContext } from "./AuthContext";

//доступ к контроллеру аккаунта из любого компонента внутри AuthProvider
export default function useAuth() {
  const controller = useContext(AuthContext);

  if (!controller) {
    throw new Error("useAuth нужно вызывать внутри AuthProvider");
  }

  return controller;
}
