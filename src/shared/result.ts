//результат действия контроллера: либо данные, либо понятный текст ошибки.
//Контроллер не показывает сообщения сам — это решает страница (тост, текст под формой).
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function success<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function failure<T = never>(error: string): ActionResult<T> {
  return { ok: false, error };
}
