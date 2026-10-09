import { useState, type FormEvent } from "react";

import type {
  CreateTaskRequest,
  TaskDifficulty,
} from "../../types/task";

import "./CreateTaskModal.css";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (task: CreateTaskRequest) => void;
}

export default function CreateTaskModal({
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [difficulty, setDifficulty] =
    useState<TaskDifficulty | "">("");
  const [category, setCategory] = useState("");

const [errors, setErrors] = useState({
  title: false,
  date: false,
  difficulty: false,
});//эт состоние ошибки

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const newErrors = {
    title: title.trim() === "",
    date: date === "",
    difficulty: difficulty === "",
  };

  setErrors(newErrors);

  if (!title.trim() || !date || !difficulty) {
    return;
  }

  onCreate({
    title,
    description: description || null,
    date,
    difficulty,
    category: category || null,
  });

  onClose();
}

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <h2>Новая задача</h2>

        <form onSubmit={handleSubmit}>
          <label>
  Название

  <input
    type="text"
    placeholder="Введите название"
    value={title}
    className={errors.title ? "input-error" : ""}
    onChange={(event) => {
      setTitle(event.target.value);

      if (errors.title) {
        setErrors({
          ...errors,
          title: false,
        });
      }
    }}
  />

  {errors.title && (
    <span className="error-text">
      Введите название задачи
    </span>
  )}
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

          <label>
  Дата

  <input
    type="date"
    value={date}
    className={errors.date ? "input-error" : ""}
    onChange={(event) => {
      setDate(event.target.value);

      if (errors.date) {
        setErrors({
          ...errors,
          date: false,
        });
      }
    }}
  />

  {errors.date && (
    <span className="error-text">
      Выберите дату
    </span>
  )}
</label>

<label>
  Сложность

  <select
    value={difficulty}
    className={errors.difficulty ? "input-error" : ""}
    onChange={(event) => {
      setDifficulty(
        event.target.value as TaskDifficulty,
      );

      if (errors.difficulty) {
        setErrors({
          ...errors,
          difficulty: false,
        });
      }
    }}
  >
    <option value="" disabled>
      Выберите сложность
    </option>

    <option value="easy">
      Лёгкая
    </option>

    <option value="medium">
      Средняя
    </option>

    <option value="hard">
      Сложная
    </option>
  </select>

  {errors.difficulty && (
    <span className="error-text">
      Выберите сложность
    </span>
  )}
</label>

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

          <div>
            <button
              type="button"
              onClick={onClose}
            >
              Отмена
            </button>

            <button type="submit">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}