import "./CreateTaskModal.css";

interface CreateTaskModalProps {
  onClose: () => void;
}

export default function CreateTaskModal({
  onClose,
}: CreateTaskModalProps) {
  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <h2>Новая задача</h2>

        <form>
          <label>
            Название
            <input
              type="text"
              placeholder="Введите название"
            />
          </label>

          <label>
            Описание
            <textarea
              placeholder="Введите описание"
            />
          </label>

          <label>
            Дата
            <input type="date" />
          </label>

          <label>
            Сложность
            <select defaultValue="">
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