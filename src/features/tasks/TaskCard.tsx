import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { Task } from "../../types/task";
import { LOGS_BY_DIFFICULTY, POINTS_BY_DIFFICULTY } from "../../types/task";
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  getDateLabel,
  isTaskOverdue,
  plural,
} from "./taskUtils";
import { startLogDrag } from "./logDrag";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  //показывать дату (когда в списке задачи разных дней — «Неделя», «Просрочено»)
  showDate?: boolean;
  //checkbox — элемент, от которого бревно полетит в костёр
  onComplete: (task: Task, from: HTMLElement) => void;
  onDropToFire: (task: Task) => void;
  onFail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

//элементы, на которых перетаскивание не начинается: кнопки, чекбокс, меню
const INTERACTIVE = "button, input, a, [role='menu']";

//передаем все свойства из таск в нашу карточку

export default function TaskCard({
  task,
  showDate = false,
  onComplete,
  onDropToFire,
  onFail,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLElement>(null);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const isActive = task.status === "active";

  //просроченная задача — день прошёл, а задача всё ещё активна
  const isOverdue = isTaskOverdue(task);

  // закрываем меню «⋯» по клику мимо него и по Esc
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isMenuOpen]);

  //задачу-бревно тянут в костёр: мышью — за любое место строки, пальцем — за ручку ⠿
  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!isActive || event.button !== 0 || !rowRef.current) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest(INTERACTIVE)) {
      return;
    }

    if (event.pointerType !== "mouse" && !target.closest(".task-card-handle")) {
      return;
    }

    //не выделяем текст, пока тянем
    event.preventDefault();

    startLogDrag(event.nativeEvent, {
      title: task.title,
      source: rowRef.current,
      onDrop: () => onDropToFire(task),
      onDragChange: setIsDragging,
    });
  }

  const classNames = ["task-card"];

  if (!isActive) classNames.push(`task-card-${task.status}`);
  if (isOverdue) classNames.push("task-card-overdue");
  if (isDragging) classNames.push("task-card-dragging");

  const logs = LOGS_BY_DIFFICULTY[task.difficulty];

  return (
    <article
      ref={rowRef}
      className={classNames.join(" ")}
      title={task.description ?? undefined}
      onPointerDown={handlePointerDown}
    >
      <span
        className="task-card-handle"
        title={isActive ? "Перетащите в костёр" : undefined}
        aria-hidden="true"
      >
        ⠿
      </span>

      {/* галочка «Выполнено»: у активной задачи — кнопка, у отмеченной — просто значок */}
      <button
        ref={checkboxRef}
        type="button"
        className={`task-card-checkbox task-card-checkbox-${task.status}`}
        disabled={!isActive}
        aria-label={
          isActive ? `Отметить «${task.title}» выполненной` : `${STATUS_LABELS[task.status]}: «${task.title}»`
        }
        onClick={() => checkboxRef.current && onComplete(task, checkboxRef.current)}
      >
        {task.status === "completed" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
        {task.status === "failed" && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        )}
      </button>

      <div className="task-card-body">
        <h3>{task.title}</h3>

        <p className="task-card-meta">
          {(showDate || isOverdue) && (
            <>
              <span className={isOverdue ? "task-deadline task-deadline-overdue" : "task-deadline"}>
                {isOverdue ? "Просрочено · " : ""}
                {getDateLabel(task.date)}
              </span>
              {" · "}
            </>
          )}
          {DIFFICULTY_LABELS[task.difficulty]}
          {isActive && (
            <span className="task-card-reward">
              {" · "}+{POINTS_BY_DIFFICULTY[task.difficulty]} очков, {logs}{" "}
              {plural(logs, ["бревно", "бревна", "брёвен"])}
            </span>
          )}
        </p>
      </div>

      {task.category && (
        <span className="task-card-category">{task.category}</span>
      )}

      {isActive ? (
        <div className="task-card-menu" ref={menuRef}>
          <button
            type="button"
            className="task-card-menu-button"
            aria-label="Действия с задачей"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ⋯
          </button>

          {isMenuOpen && (
            <div className="task-card-menu-list" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(task);
                }}
              >
                Изменить
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onFail(task);
                }}
              >
                Не выполнил
              </button>

              <button
                type="button"
                role="menuitem"
                className="task-card-menu-danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(task);
                }}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      ) : (
        <span className={`task-card-status task-card-status-${task.status}`}>
          {STATUS_LABELS[task.status]}
        </span>
      )}
    </article>
  );
}

//просто даем возможность пользоваться и другим файлам этой карточкой со всеми свойствами
