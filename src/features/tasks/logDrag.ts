// Перетаскивание задачи-«бревна» в костёр (п. 1.6.2).
//
// Сделано на pointer-событиях, а не на HTML5 drag-and-drop:
// так перетаскивание работает и мышью, и пальцем на сенсорном экране,
// а отпущенное мимо бревно плавно возвращается на место.

type HoverListener = (isOver: boolean) => void;

interface FireZone {
  element: HTMLElement;
  onHover: HoverListener;
}

//костёр на странице один — он регистрирует себя как место, куда можно бросить бревно
let fireZone: FireZone | null = null;

export function registerFireZone(element: HTMLElement, onHover: HoverListener) {
  fireZone = { element, onHover };

  return () => {
    if (fireZone?.element === element) {
      fireZone = null;
    }
  };
}

function isOverFire(x: number, y: number): boolean {
  if (!fireZone) {
    return false;
  }

  const rect = fireZone.element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

//«бревно», которое летит за курсором: полоска с названием задачи
function createLog(title: string): HTMLElement {
  const log = document.createElement("div");
  log.className = "log-ghost";
  log.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = title;
  log.append(label);

  document.body.append(log);
  return log;
}

function placeLog(log: HTMLElement, x: number, y: number) {
  log.style.left = `${x - log.offsetWidth / 2}px`;
  log.style.top = `${y - log.offsetHeight / 2}px`;
}

const DRAG_THRESHOLD_PX = 6;

interface LogDragOptions {
  title: string;
  //откуда взяли задачу — туда вернётся бревно, если его отпустили мимо
  source: HTMLElement;
  onDrop: () => void;
  onDragChange?: (isDragging: boolean) => void;
}

//вызывается на pointerdown строки задачи
export function startLogDrag(event: PointerEvent, options: LogDragOptions) {
  const { pointerId } = event;
  const startX = event.clientX;
  const startY = event.clientY;

  let log: HTMLElement | null = null;
  let over = false;

  function handleMove(moveEvent: PointerEvent) {
    if (moveEvent.pointerId !== pointerId) {
      return;
    }

    if (!log) {
      //маленькое движение — это ещё клик, а не перетаскивание
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < DRAG_THRESHOLD_PX) {
        return;
      }

      log = createLog(options.title);
      document.body.classList.add("is-dragging-log");
      options.onDragChange?.(true);
    }

    moveEvent.preventDefault();
    placeLog(log, moveEvent.clientX, moveEvent.clientY);

    const nowOver = isOverFire(moveEvent.clientX, moveEvent.clientY);

    if (nowOver !== over) {
      over = nowOver;
      fireZone?.onHover(over);
    }
  }

  function handleEnd(endEvent: PointerEvent) {
    if (endEvent.pointerId !== pointerId) {
      return;
    }

    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleEnd);
    window.removeEventListener("pointercancel", handleEnd);

    if (!log) {
      return;
    }

    const ghost = log;

    document.body.classList.remove("is-dragging-log");
    fireZone?.onHover(false);
    options.onDragChange?.(false);

    if (over && endEvent.type === "pointerup") {
      ghost.remove();
      options.onDrop();
      return;
    }

    //отпустили мимо костра — бревно возвращается на место
    const from = ghost.getBoundingClientRect();
    const to = options.source.getBoundingClientRect();

    const animation = ghost.animate(
      [
        { transform: "translate(0, 0)", opacity: 1 },
        {
          transform: `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${
            to.top + to.height / 2 - (from.top + from.height / 2)
          }px)`,
          opacity: 0.2,
        },
      ],
      { duration: prefersReducedMotion() ? 0 : 280, easing: "ease-in" },
    );

    animation.onfinish = () => ghost.remove();
  }

  window.addEventListener("pointermove", handleMove, { passive: false });
  window.addEventListener("pointerup", handleEnd);
  window.addEventListener("pointercancel", handleEnd);
}

//галочка «Выполнено»: бревно само улетает в костёр
export function flyLogToFire(source: HTMLElement, title: string): Promise<void> {
  if (!fireZone || prefersReducedMotion()) {
    return Promise.resolve();
  }

  const log = createLog(title);
  const from = source.getBoundingClientRect();
  const to = fireZone.element.getBoundingClientRect();

  placeLog(log, from.left + from.width / 2, from.top + from.height / 2);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height * 0.4 - (from.top + from.height / 2);

  const animation = log.animate(
    [
      { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) rotate(-12deg) scale(0.85)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(-20deg) scale(0.4)`, opacity: 0 },
    ],
    { duration: 650, easing: "ease-in-out" },
  );

  return new Promise((resolve) => {
    animation.onfinish = () => {
      log.remove();
      resolve();
    };
  });
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
