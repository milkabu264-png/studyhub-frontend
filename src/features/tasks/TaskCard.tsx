import type { Task } from "../../types/task";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
}

//передаем все свойства из таск в нашу карточку

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <h3>{task.title}</h3>

      {task.description && (
        <p>{task.description}</p>
      )}

      <div>
        <span>{task.difficulty}</span>
        <span>{task.category}</span>
      </div>
    </article>
  );
}

//просто даем возможность пользоваться и другим файлам этой карточкой со всеми свойствами