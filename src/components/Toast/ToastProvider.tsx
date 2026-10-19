import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ToastContext } from "./ToastContext";
import type { ToastKind } from "./ToastContext";

import "./Toast.css";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_MS = 3500;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;

    setToasts((current) => [...current, { id, message, kind }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* role="status" — экранный диктор прочитает сообщение */}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
