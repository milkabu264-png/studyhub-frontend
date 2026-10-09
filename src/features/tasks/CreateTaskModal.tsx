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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title || !date || !difficulty) {
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
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
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
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </label>

          <label>
            Сложность

            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value as TaskDifficulty,
                )
              }
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