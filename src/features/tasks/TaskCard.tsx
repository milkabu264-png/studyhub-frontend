import type { Task } from "../../types/task";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
}

//передаем все свойства из таск в нашу карточку

export default function TaskCard({ task }: TaskCardProps) {
  const formattedDate = new Date(
  `${task.date}T00:00:00`,
).toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
});

const today = new Date();
today.setHours(0, 0, 0, 0);

const deadline = new Date(`${task.date}T00:00:00`);

const isOverdue =
  deadline < today &&
  task.status === "active";

  return (
    <article className="task-card">
      <h3>{task.title}</h3>

      {task.description && (
        <p>{task.description}</p>
      )}

<div>
  <span>{task.difficulty}</span>

  {task.category && (
    <span>{task.category}</span>
  )}
</div>
<p
  className={
    isOverdue
      ? "task-deadline task-deadline-overdue"
      : "task-deadline"
  }
>
  До {formattedDate}
</p><p
  className={
    isOverdue
      ? "task-deadline task-deadline-overdue"
      : "task-deadline"
  }
>
  До {formattedDate}
</p>
    </article>
  );
}

//просто даем возможность пользоваться и другим файлам этой карточкой со всеми свойствами