import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";

import type { Task } from "../../types/task";
import {
  DIFFICULTY_LABELS,
  getDateLabel,
  isTaskOverdue,
} from "./taskUtils";
import "./TaskCard.css";

// формат данных при перетаскивании задачи — его же ждёт костёр на главной
export const TASK_DRAG_TYPE = "text/task-id";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

//передаем все свойства из таск в нашу карточку

export default function TaskCard({
  task,
  onToggleComplete,
  onDelete,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCompleted = task.status === "completed";

  //просроченная задача — дедлайн прошёл, а задача всё ещё активна
  const isOverdue = isTaskOverdue(task);

  // закрываем меню «⋯» по клику мимо него
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const [isDragging, setIsDragging] = useState(false);

  //задачу можно сжечь двумя способами: галочкой или перетащив строку в костёр.
  //Перетаскивать можно всю строку, а не только ручку ⠿
  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData(TASK_DRAG_TYPE, String(task.id));
    //запасной формат — некоторые браузеры (Firefox) без text/plain не начинают перетаскивание
    event.dataTransfer.setData("text/plain", task.title);
    event.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  const classNames = ["task-card"];

  if (isCompleted) classNames.push("task-card-completed");
  if (isDragging) classNames.push("task-card-dragging");

  return (
    <article
      className={classNames.join(" ")}
      title={task.description ?? undefined}
      draggable={!isCompleted}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
    >
      <span
        className="task-card-handle"
        title={isCompleted ? undefined : "Перетащите в костёр"}
      >
        ⠿
      </span>

      <input
        type="checkbox"
        className="task-card-checkbox"
        checked={isCompleted}
        onChange={() => onToggleComplete(task.id)}
        aria-label={`Отметить «${task.title}» выполненной`}
      />

      <div className="task-card-body">
        <h3>{task.title}</h3>

        <p className="task-card-meta">
          <span
            className={
              isOverdue
                ? "task-deadline task-deadline-overdue"
                : "task-deadline"
            }
          >
            {isOverdue ? "Просрочено · " : ""}
            {getDateLabel(task.date)}
          </span>
          {" · "}
          {DIFFICULTY_LABELS[task.difficulty]}
        </p>
      </div>

      {task.category && (
        <span className="task-card-category">{task.category}</span>
      )}

      <div className="task-card-menu" ref={menuRef}>
        <button
          type="button"
          className="task-card-menu-button"
          aria-label="Действия с задачей"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ⋯
        </button>

        {isMenuOpen && (
          <div className="task-card-menu-list">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onToggleComplete(task.id);
              }}
            >
              {isCompleted ? "Вернуть в работу" : "Выполнено"}
            </button>

            <button
              type="button"
              className="task-card-menu-danger"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(task.id);
              }}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

//просто даем возможность пользоваться и другим файлам этой карточкой со всеми свойствами
