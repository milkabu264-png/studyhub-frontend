import { useState } from "react";

import CreateTaskModal from "../../features/tasks/CreateTaskModal";
import TaskList from "../../features/tasks/TaskList";
import useTasks from "../../features/tasks/useTasks";
import CampfireCard from "../../features/campfire/CampfireCard";
import {
  countBurnedToday,
  toDateString,
} from "../../features/tasks/taskUtils";

import "./HomePage.css";

// Главная страница (View).
// Данные и действия с задачами берёт из контроллера useTasks,
// а сама только раскладывает блоки: список задач и костёр.

export default function HomePage() {

  const {
    tasks,
    isLoading,
    error,
    reloadTasks,
    clearError,
    handleCreateTask,
    handleToggleComplete,
    handleDeleteTask,
    handleBurnTask,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);

  //название из строки «Добавить задачу», с которым открывается форма
  const [quickTitle, setQuickTitle] = useState("");

  function openModal(title = "") {
    setQuickTitle(title);
    setIsModalOpen(true);
  }

const today = new Date();

const formattedDate = today.toLocaleDateString("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

//«среда, 14 октября» → «Среда, 14 октября»
const capitalizedDate =
  formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="home-page">
      <div className="home-date">
        <div>
          <h1>Хороший день начинается с малого</h1>
          <p>{capitalizedDate} · Разожгите фокус и оставьте лишнее в огне.</p>
        </div>

        <button
          type="button"
          className="home-add-button"
          onClick={() => openModal()}
        >
          + Новая задача
        </button>
      </div>

      <div className="home-content">
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Ваши задачи, без спешки</h2>
          </div>

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            onRetry={() => void reloadTasks()}
            onCloseError={clearError}
            onToggleComplete={(id) => void handleToggleComplete(id)}
            onDelete={(id) => void handleDeleteTask(id)}
            onQuickAdd={(title) => openModal(title)}
          />
        </section>

        <CampfireCard
          logsToday={countBurnedToday(tasks)}
          onBurnTask={handleBurnTask}
        />
      </div>
{isModalOpen && (
  <CreateTaskModal
    onClose={() => setIsModalOpen(false)}
    onCreate={(data) => void handleCreateTask(data)}
    initialTitle={quickTitle}
    initialDate={quickTitle ? toDateString(today) : ""}
  />
)}
    </div>
  );
}
