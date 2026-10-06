const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    //ждеи ответ сервера, мы проверяем статус ответа. Если статус не является успешным (не в диапазоне 200-299),
    //мы пытаемся получить сообщение об ошибке из тела ответа. Если это удается, мы используем это сообщение,
    //иначе используем стандартное сообщение об ошибке. Затем мы выбрасываем исключение с этим сообщением.

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

//это асинхронная функция (может содержать await), 
//которая выполняет HTTP-запрос к API и возвращает результат в виде объекта типа T
//Этот тип предполгает, что функция может быть использована для получения данных любого типа,
//который будет определен при вызове функции. 
//Функция принимает два параметра: path - путь к ресурсу API, 
//и options - объект с дополнительными параметрами запроса (например, метод, тело запроса и т.д.).

  if (!response.ok) {
    let message = "Произошла ошибка";

    try {
      const error = await response.json();

      if (error.message) {
        message = error.message;
      }
    } catch {
      message = "Не удалось получить ответ от сервера";
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

//это функция, которая проверяет успешность ответа от сервера.