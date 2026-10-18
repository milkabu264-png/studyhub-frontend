import { useContext } from "react";

import { ConfirmContext } from "./ConfirmContext";

//const confirm = useConfirm();
//if (await confirm({ title: "Вы точно…?" })) { … }
export default function useConfirm() {
  const confirm = useContext(ConfirmContext);

  if (!confirm) {
    throw new Error("useConfirm нужно вызывать внутри ConfirmProvider");
  }

  return confirm;
}
