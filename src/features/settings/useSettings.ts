import { useContext } from "react";

import { SettingsContext } from "./SettingsContext";

//доступ к контроллеру настроек из любого компонента внутри SettingsProvider
export default function useSettings() {
  const controller = useContext(SettingsContext);

  if (!controller) {
    throw new Error("useSettings нужно вызывать внутри SettingsProvider");
  }

  return controller;
}
