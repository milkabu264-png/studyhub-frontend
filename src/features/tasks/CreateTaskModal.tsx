import { useEffect, useState, type FormEvent } from "react";

import type {
  CreateTaskRequest,
  Task,
  TaskDifficulty,
} from "../../types/task";
import { TASK_TITLE_MAX_LENGTH } from "../../types/task";
import { todayString } from "./taskUtils";

import "./CreateTaskModal.css";

interface CreateTaskModalProps {
  onClose: () => void;
  //возвращает текст ошибки сервера или null, если всё сохранилось
  onSubmit: (task: CreateTaskRequest) => Promise<string | null>;
  //задача, которую редактируем; без неё — создаём новую
  editingTask?: Task | null;
  //необязательно: чем заполнить поля сразу (например, после ввода в строке «Добавить задачу»)
  initialTitle?: string;
  initialDate?: string;
}

//форма задачи: создание (п. 1.2.1) и редактирование (п. 1.2.3)

export default function CreateTaskModal({
  onClose,
  onSubmit,
  editingTask = null,
  initialTitle = "",
  initialDate = "",
}: CreateTaskModalProps) {
  const [title, setTitle] = useState(editingTask?.title ?? initialTitle);
  const [description, setDescription] = useState(editingTask?.description ?? "");
  const [date, setDate] = useState(editingTask?.date ?? initialDate);
  const [difficulty, setDifficulty] =
    useState<TaskDifficulty | "">(editingTask?.difficulty ?? "");
  const [category, setCategory] = useState(editingTask?.category ?? "");

  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    difficulty?: string;
  }>({});//эт состоние ошибки

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = todayString();

  //прошедшую дату нельзя выбрать — кроме случая, когда задача уже на ней стоит
  const minDate = editingTask && editingTask.date < today ? editingTask.date : today;

  //Esc закрывает окно
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function validate() {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Введите название задачи";
    } else if (title.trim().length > TASK_TITLE_MAX_LENGTH) {
      newErrors.title = "Название слишком длинное";
    }

    if (!date) {
      newErrors.date = "Выберите дату";
    } else if (date < today && date !== editingTask?.date) {
      newErrors.date = "Нельзя добавить задачу на прошедший день";
    }

    if (!difficulty) {
      newErrors.difficulty = "Выберите уровень сложности";
    }

    return newErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !difficulty) {
      return;
    }

    setIsSaving(true);
    setServerError(null);

    const error = await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      date,
      difficulty,
      category: category.trim() || null,
    });

    setIsSaving(false);

    if (error) {
      setServerError(error);
      return;
    }

    onClose();
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="task-modal-title">{editingTask ? "Редактирование" : "Новая задача"}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Название

            <input
              type="text"
              placeholder="Введите название"
              autoFocus
              maxLength={TASK_TITLE_MAX_LENGTH + 1}
              value={title}
              className={errors.title ? "input-error" : ""}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors({ ...errors, title: undefined });
              }}
            />

            {errors.title && <span className="error-text">{errors.title}</span>}
          </label>

          <label>
            Описание

            <textarea
              placeholder="Введите описание"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </label>

          <div className="task-modal-row">
            <label>
              Дата

              <input
                type="date"
                min={minDate}
                value={date}
                className={errors.date ? "input-error" : ""}
                onChange={(event) => {
                  setDate(event.target.value);
                  setErrors({ ...errors, date: undefined });
                }}
              />

              {errors.date && <span className="error-text">{errors.date}</span>}
            </label>

            <label>
              Сложность

              <select
                value={difficulty}
                className={errors.difficulty ? "input-error" : ""}
                onChange={(event) => {
                  setDifficulty(event.target.value as TaskDifficulty);
                  setErrors({ ...errors, difficulty: undefined });
                }}
              >
                <option value="" disabled>
                  Выберите сложность
                </option>

                <option value="easy">
                  Лёгкая — 10 очков, 5 брёвен
                </option>

                <option value="medium">
                  Средняя — 20 очков, 10 брёвен
                </option>

                <option value="hard">
                  Сложная — 30 очков, 15 брёвен
                </option>
              </select>

              {errors.difficulty && <span className="error-text">{errors.difficulty}</span>}
            </label>
          </div>

          <label>
            Категория

            <input
              type="text"
              placeholder="Например: Учёба"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            />
          </label>

          {serverError && <p className="task-modal-error" role="alert">{serverError}</p>}

          <div className="task-modal-actions">
            <button
              type="button"
              onClick={onClose}
            >
              Отмена
            </button>

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Сохраняем…" : editingTask ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
