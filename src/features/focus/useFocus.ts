import { useContext } from "react";

import { FocusContext } from "./FocusContext";

export default function useFocus() {
  const controller = useContext(FocusContext);

  if (!controller) {
    throw new Error("useFocus нужно вызывать внутри FocusProvider");
  }

  return controller;
}
