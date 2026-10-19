import { useState } from "react";
import type { FormEvent } from "react";

import type { Task, TaskDifficulty, TaskStatus } from "../../types/task";
import TaskCard from "./TaskCard";
import {
  DEFAULT_FILTERS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  getDayProgress,
  getVisibleTasks,
  hasActiveFilters,
  plural,
} from "./taskUtils";
import type { TaskFilters, TaskRange, TaskSort } from "./taskUtils";
import "./TaskList.css";

interface TaskListProps {
  //все задачи пользователя — список сам выбирает нужные по дню и фильтрам
  tasks: Task[];
  selectedDate: string;
  //на прошедший день задачи добавлять нельзя
  canAdd: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onComplete: (task: Task, from: HTMLElement) => void;
  onDropToFire: (task: Task) => void;
  onFail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  //Enter в строке «Добавить задачу» — главная откроет форму с этим названием
  onQuickAdd: (title: string) => void;
}

const RANGES: { range: TaskRange; label: string }[] = [
  { range: "day", label: "День" },
  { range: "week", label: "Неделя" },
  { range: "overdue", label: "Просрочено" },
];

export default function TaskList({
  tasks,
  selectedDate,
  canAdd,
  isLoading = false,
  error = null,
  onRetry,
  onComplete,
  onDropToFire,
  onFail,
  onEdit,
  onDelete,
  onQuickAdd,
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const visibleTasks = getVisibleTasks(tasks, selectedDate, filters);
  const progress = getDayProgress(tasks, selectedDate);

  //сколько дополнительных фильтров включено — число на кнопке «Фильтры»
  const extraFilters =
    Number(filters.status !== "all") + Number(filters.difficulty !== "all") + Number(filters.sort !== "default");

  function setFilter<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) {
    setFilters({ ...filters, [key]: value });
  }

  function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim()) {
      return;
    }

    onQuickAdd(newTitle.trim());
    setNewTitle("");
  }

  function getEmptyText(): string {
    if (hasActiveFilters(filters)) return "По выбранным фильтрам задач нет";
    if (tasks.length === 0) return "У вас пока нет задач. Создайте первую";
    return "На этот день задач нет";
  }

  return (
    <div className="task-list-wrapper">
      <div className="task-list-toolbar">
        <div className="task-tabs" role="group" aria-label="Срок">
          {RANGES.map(({ range, label }) => (
            <button
              key={range}
              type="button"
              aria-pressed={filters.range === range}
              className={filters.range === range ? "task-tab task-tab-active" : "task-tab"}
              onClick={() => setFilter("range", range)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={isFiltersOpen ? "task-filter-toggle task-filter-toggle-open" : "task-filter-toggle"}
          aria-expanded={isFiltersOpen}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          Фильтры
          {extraFilters > 0 && <span className="task-filter-count">{extraFilters}</span>}
        </button>
      </div>

      {/* дополнительные фильтры и сортировка (п. 1.2.7) */}
      {isFiltersOpen && (
        <div className="task-filters">
          <label>
            Статус
            <select
              value={filters.status}
              onChange={(event) => setFilter("status", event.target.value as "all" | TaskStatus)}
            >
              <option value="all">Все</option>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </label>

          <label>
            Сложность
            <select
              value={filters.difficulty}
              onChange={(event) => setFilter("difficulty", event.target.value as "all" | TaskDifficulty)}
            >
              <option value="all">Любая</option>
              {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((difficulty) => (
                <option key={difficulty} value={difficulty}>{DIFFICULTY_LABELS[difficulty]}</option>
              ))}
            </select>
          </label>

          <label>
            Сортировка
            <select
              value={filters.sort}
              onChange={(event) => setFilter("sort", event.target.value as TaskSort)}
            >
              <option value="default">По дате</option>
              <option value="difficulty">По сложности</option>
              <option value="status">По статусу</option>
            </select>
          </label>

          <button
            type="button"
            className="task-filters-reset"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Сбросить
          </button>
        </div>
      )}

      {filters.range === "day" && progress.total > 0 && (
        <div className="task-progress">
          <div className="task-progress-labels">
            <span>
              {progress.done} из {progress.total}{" "}
              {plural(progress.total, ["задачи", "задач", "задач"])} выполнено
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
      )}

      {error && (
        <div className="task-error" role="alert">
          <span>{error}</span>

          {onRetry && (
            <button type="button" onClick={onRetry}>
              Повторить
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
        !error && <p className="task-list-empty">{getEmptyText()}</p>
      ) : (
        <div className="task-list">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showDate={filters.range !== "day"}
              onComplete={onComplete}
              onDropToFire={onDropToFire}
              onFail={onFail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {canAdd ? (
        <form className="task-quick-add" onSubmit={handleQuickAdd}>
          <span aria-hidden="true">+</span>
          <input
            type="text"
            aria-label="Название новой задачи"
            placeholder="Добавить задачу и нажать Enter"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
        </form>
      ) : (
        <p className="task-quick-add-disabled">
          Это прошедший день: новые задачи сюда добавить нельзя, но неотмеченные можно отметить.
        </p>
      )}

      <div className="task-hint">
        <span aria-hidden="true">⠿</span>
        <span>Готово? Поставьте галочку или перетащите задачу-бревно в костёр.</span>
        <span aria-hidden="true">→</span>
      </div>
    </div>
  );
}
