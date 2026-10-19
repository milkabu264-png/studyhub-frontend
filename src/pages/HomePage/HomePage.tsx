import { useState } from "react";
import { useLocation } from "react-router-dom";

import CreateTaskModal from "../../features/tasks/CreateTaskModal";
import TaskList from "../../features/tasks/TaskList";
import useTasks from "../../features/tasks/useTasks";
import CampfireCard from "../../features/campfire/CampfireCard";
import useCampfire from "../../features/campfire/useCampfire";
import Calendar from "../../features/calendar/Calendar";
import { flyLogToFire } from "../../features/tasks/logDrag";
import {
  addDays,
  formatDayTitle,
  getDateLabel,
  getDayMarks,
  isPastDay,
  plural,
  todayString,
} from "../../features/tasks/taskUtils";
import useConfirm from "../../components/ConfirmDialog/useConfirm";
import useToast from "../../components/Toast/useToast";

import type { CreateTaskRequest, Task } from "../../types/task";
import { LOGS_BY_DIFFICULTY, POINTS_BY_DIFFICULTY } from "../../types/task";

import "./HomePage.css";

// Главная страница (View).
// Задачи берёт из контроллера useTasks, костёр — из useCampfire,
// сама связывает их: выполненная задача подкидывает брёвна в костёр.

//какое окно задачи открыто: создание (с подставленным названием и датой) или редактирование
type ModalState =
  | { mode: "create"; title: string; date: string }
  | { mode: "edit"; task: Task }
  | null;

function logsText(count: number): string {
  return `${count} ${plural(count, ["бревно", "бревна", "брёвен"])}`;
}

export default function HomePage() {
  const location = useLocation();
  const confirm = useConfirm();
  const showToast = useToast();

  const {
    tasks,
    isLoading,
    error,
    reloadTasks,
    handleCreateTask,
    handleUpdateTask,
    handleCompleteTask,
    handleFailTask,
    handleDeleteTask,
  } = useTasks();

  const campfire = useCampfire();

  //выбранный в календаре день
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [modal, setModal] = useState<ModalState>(null);

  const today = todayString();
  const isPast = isPastDay(selectedDate);

  //пришли из шапки по ссылке «Идёт фокус» — сразу открываем таймер
  const openFocus = (location.state as { openFocus?: boolean } | null)?.openFocus ?? false;

  //«Выполнено» — галочкой (from = галочка, бревно полетит от неё) или перетаскиванием в костёр
  async function completeTask(task: Task, from?: HTMLElement) {
    const points = POINTS_BY_DIFFICULTY[task.difficulty];
    const logs = LOGS_BY_DIFFICULTY[task.difficulty];

    const ok = await confirm({
      title: "Вы точно подтверждаете выполнение?",
      text: `«${task.title}»: +${points} очков и ${logsText(logs)} в костёр. Отменить выполнение будет нельзя.`,
      confirmText: "Да, выполнено",
    });

    if (!ok) {
      return;
    }

    //бревно летит в костёр, пока сервер сохраняет выполнение
    const flight = from ? flyLogToFire(from, task.title) : Promise.resolve();
    const [result] = await Promise.all([handleCompleteTask(task.id), flight]);

    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }

    campfire.applyCampfire(result.data.campfire);

    if (result.data.logsAdded < logs) {
      showToast("Костёр полон: брёвна сверх 100 не добавлены", "info");
    } else {
      showToast(`+${points} очков, ${logsText(logs)} в костёр`);
    }
  }

  async function failTask(task: Task) {
    const ok = await confirm({
      title: "Вы точно отмечаете задачу как невыполненную?",
      text: `«${task.title}» попадёт в статистику как невыполненная и не даст брёвен. Изменить это будет нельзя.`,
      confirmText: "Да, не выполнил",
    });

    if (!ok) {
      return;
    }

    const result = await handleFailTask(task.id);
    showToast(result.ok ? "Задача отмечена как невыполненная" : result.error, result.ok ? "info" : "error");
  }

  async function deleteTask(task: Task) {
    const ok = await confirm({
      title: "Удалить задачу?",
      text: `«${task.title}» исчезнет из списка.`,
      confirmText: "Удалить",
      danger: true,
    });

    if (!ok) {
      return;
    }

    const result = await handleDeleteTask(task.id);
    showToast(result.ok ? "Задача удалена" : result.error, result.ok ? "success" : "error");
  }

  //сохранить форму задачи; вернуть текст ошибки — форма покажет его у себя
  async function submitTask(data: CreateTaskRequest): Promise<string | null> {
    if (modal?.mode === "edit") {
      const result = await handleUpdateTask(modal.task.id, data);

      if (!result.ok) return result.error;

      showToast("Изменения сохранены");
      return null;
    }

    const result = await handleCreateTask(data);

    if (!result.ok) return result.error;

    showToast(
      data.date === selectedDate ? "Задача создана" : `Задача добавлена на ${getDateLabel(data.date).toLowerCase()}`,
    );
    return null;
  }

  function openCreate(title = "") {
    setModal({ mode: "create", title, date: isPast ? today : selectedDate });
  }

  return (
    <div className="home-page">
      <div className="home-date">
        <div>
          <h1>Хороший день начинается с малого</h1>

          {/* выбранный день и стрелки «назад» / «вперёд» (п. 1.2.8) */}
          <div className="home-day-nav">
            <button
              type="button"
              className="home-day-arrow"
              aria-label="Предыдущий день"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              ‹
            </button>

            <p className="home-day-title" aria-live="polite">
              {formatDayTitle(selectedDate)}
              {selectedDate === today && <span className="home-day-badge">сегодня</span>}
            </p>

            <button
              type="button"
              className="home-day-arrow"
              aria-label="Следующий день"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              ›
            </button>

            {selectedDate !== today && (
              <button type="button" className="home-day-today" onClick={() => setSelectedDate(today)}>
                Сегодня
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          className="home-add-button"
          disabled={isPast}
          title={isPast ? "На прошедший день задачу добавить нельзя" : undefined}
          onClick={() => openCreate()}
        >
          + Добавить задачу
        </button>
      </div>

      <div className="home-content">
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Ваши задачи, без спешки</h2>
          </div>

          <TaskList
            tasks={tasks}
            selectedDate={selectedDate}
            canAdd={!isPast}
            isLoading={isLoading}
            error={error}
            onRetry={() => void reloadTasks()}
            onComplete={(task, from) => void completeTask(task, from)}
            onDropToFire={(task) => void completeTask(task)}
            onFail={(task) => void failTask(task)}
            onEdit={(task) => setModal({ mode: "edit", task })}
            onDelete={(task) => void deleteTask(task)}
            onQuickAdd={(title) => openCreate(title)}
          />
        </section>

        <aside className="home-side">
          <CampfireCard
            logs={campfire.logs}
            state={campfire.state}
            logsToNextState={campfire.logsToNextState}
            minutesToNextBurn={campfire.minutesToNextBurn}
            isLoading={campfire.isLoading}
            error={campfire.error}
            onRetry={() => void campfire.reloadCampfire()}
            hasActiveTasks={tasks.some((task) => task.status === "active")}
            openFocus={openFocus}
          />

          <Calendar
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            marks={getDayMarks(tasks)}
          />
        </aside>
      </div>
{modal && (
  <CreateTaskModal
    key={modal.mode === "edit" ? modal.task.id : "new"}
    onClose={() => setModal(null)}
    onSubmit={submitTask}
    editingTask={modal.mode === "edit" ? modal.task : null}
    initialTitle={modal.mode === "create" ? modal.title : ""}
    initialDate={modal.mode === "create" ? modal.date : ""}
  />
)}
    </div>
  );
}
