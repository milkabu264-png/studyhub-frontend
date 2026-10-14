import { useState } from "react";
import type { FormEvent } from "react";

import type { Task } from "../../types/task";
import TaskCard from "./TaskCard";
import {
  TASK_TABS,
  countTasksByTab,
  getProgress,
  getTasksForTab,
  plural,
} from "./taskUtils";
import type { TaskTab } from "./taskUtils";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  //Enter в строке «Добавить задачу» — дальше главная откроет форму с этим названием
  onQuickAdd: (title: string) => void;
  //задачи ещё загружаются — показываем заглушки строк
  isLoading?: boolean;
  //текст ошибки от сервера
  error?: string | null;
  onRetry?: () => void;
  onCloseError?: () => void;
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
  onQuickAdd,
  isLoading = false,
  error = null,
  onRetry,
  onCloseError,
}: TaskListProps) {
  const [activeTab, setActiveTab] = useState<TaskTab>("inProgress");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const counts = countTasksByTab(tasks);
  const progress = getProgress(tasks);

  //задачи текущей вкладки + фильтр поиска
  const visibleTasks = getTasksForTab(tasks, activeTab).filter((task) =>
    task.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function closeSearch() {
    setIsSearchOpen(false);
    setSearch("");
  }

  function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim()) {
      return;
    }

    onQuickAdd(newTitle.trim());
    setNewTitle("");
  }

  return (
    <div className="task-list-wrapper">
      <div className="task-list-toolbar">
        {isSearchOpen ? (
          <div className="task-search">
            <input
              autoFocus
              type="text"
              placeholder="Найти задачу…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeSearch();
              }}
            />

            <button
              type="button"
              className="task-icon-button"
              aria-label="Закрыть поиск"
              onClick={closeSearch}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div className="task-tabs">
              {TASK_TABS.map(({ tab, label }) => (
                <button
                  key={tab}
                  type="button"
                  className={
                    activeTab === tab ? "task-tab task-tab-active" : "task-tab"
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {label} · {counts[tab]}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="task-icon-button"
              aria-label="Поиск по задачам"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="task-progress">
        <div className="task-progress-labels">
          <span>
            {progress.done} из {progress.total}{" "}
            {plural(progress.total, ["задачи", "задач", "задач"])} завершены
          </span>
          <strong>{progress.percent}%</strong>
        </div>

        <div className="task-progress-track">
          <div
            className="task-progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="task-error" role="alert">
          <span>{error}</span>

          {onRetry && (
            <button type="button" onClick={onRetry}>
              Повторить
            </button>
          )}

          {onCloseError && (
            <button
              type="button"
              className="task-icon-button"
              aria-label="Скрыть ошибку"
              onClick={onCloseError}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="task-list">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="task-skeleton" />
          ))}
        </div>
      ) : visibleTasks.length === 0 ? (
        <p className="task-list-empty">
          {search ? "Ничего не нашлось" : "Здесь пока пусто"}
        </p>
      ) : (
        <div className="task-list">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <form className="task-quick-add" onSubmit={handleQuickAdd}>
        <span>+</span>
        <input
          type="text"
          placeholder="Добавить задачу и нажать Enter"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
        />
      </form>

      <div className="task-hint">
        <span>⠿</span>
                <span>Готово? Отметьте задачу галочкой или перетащите её в костёр справа.</span>
        <span>→</span>
      </div>
    </div>
  );
}
