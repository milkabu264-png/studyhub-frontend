import { useState } from "react";

import CreateTaskModal from "../../features/tasks/CreateTaskModal";
import TaskList from "../../features/tasks/TaskList";
import { mockTasks } from "../../mocks/tasks";

import type {
  Task,
  CreateTaskRequest,
} from "../../types/task";

import "./HomePage.css";



export default function HomePage() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  function handleCreateTask(data: CreateTaskRequest) {
  const newTask: Task = {
    id: Date.now(),

    title: data.title,
    description: data.description,
    date: data.date,
    difficulty: data.difficulty,
    category: data.category,

    status: "active",

    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  setTasks((currentTasks) => [
    ...currentTasks,
    newTask,
  ]);
}

  return (
    <div className="home-page">
      <div className="home-date">
        <button type="button">←</button>

        <h2>Сегодня</h2>

        <button type="button">→</button>
      </div>

      <div className="home-content">
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Задачи</h2>

<button
  type="button"
  onClick={() => setIsModalOpen(true)}
>
  Добавить задачу
</button>
          </div>

          <TaskList tasks={tasks} />
        </section>
        //просто используем заглушку для нулевой карточки
        <section className="campfire-section">
          <h2>Костёр</h2>

          <div>
            🔥
          </div>

          <p>Брёвен сегодня: 0</p>
        </section>
      </div>
{isModalOpen && (
  <CreateTaskModal
    onClose={() => setIsModalOpen(false)}
    onCreate={handleCreateTask}
  />
)}
    </div>
  );
}