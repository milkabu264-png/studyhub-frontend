import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

import ConfirmDialog from "./ConfirmDialog";
import { ConfirmContext } from "./ConfirmContext";
import type { ConfirmOptions } from "./ConfirmContext";

//один экземпляр окна подтверждения на всё приложение.
//Любой компонент вызывает `await confirm({...})` и получает true или false.

export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((answer: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((answer: boolean) => {
    resolveRef.current?.(answer);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const handleCancel = useCallback(() => close(false), [close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <ConfirmDialog
          title={options.title}
          text={options.text}
          confirmText={options.confirmText}
          danger={options.danger}
          onConfirm={() => close(true)}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}
