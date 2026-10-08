import "./HomePage.css";
import TaskCard from "../../features/tasks/TaskCard";
import { mockTasks } from "../../mocks/tasks";
import "./HomePage.css";

export default function HomePage() {
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

            <button type="button">
              Добавить задачу
            </button>
          </div>

          <TaskCard task={mockTasks[0]} /> 
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
    </div>
  );
}