import { useContext } from "react";

import { ToastContext } from "./ToastContext";

export default function useToast() {
  const showToast = useContext(ToastContext);

  if (!showToast) {
    throw new Error("useToast нужно вызывать внутри ToastProvider");
  }

  return showToast;
}
