import AppRouter from "./router";
import AuthProvider from "../features/auth/AuthProvider";
import ConfirmProvider from "../components/ConfirmDialog/ConfirmProvider";
import ToastProvider from "../components/Toast/ToastProvider";

//общие для всех страниц вещи: кто вошёл, окно подтверждения, всплывающие сообщения
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AppRouter />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
