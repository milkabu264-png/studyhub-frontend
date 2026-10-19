import { Link } from "react-router-dom";

import ActivityChart from "../../features/statistics/ActivityChart";
import BarList from "../../features/statistics/BarList";
import StatCard from "../../features/statistics/StatCard";
import StreakBanner from "../../features/statistics/StreakBanner";
import useStatistics from "../../features/statistics/useStatistics";
import { PERIOD_LABELS } from "../../features/statistics/statisticsUtils";
import { DIFFICULTY_LABELS } from "../../features/tasks/taskUtils";
import { formatDuration } from "../../features/focus/focusUtils";

import type { StatisticsPeriod } from "../../types/statistics";

import "./StatisticsPage.css";

// Страница «Статистика» (View).
// Все числа считает контроллер useStatistics, страница их только показывает.

const PERIODS: StatisticsPeriod[] = ["day", "week", "month", "range", "all"];

function StatisticsPage() {
  const {
    statistics,
    period,
    setPeriod,
    range,
    setRange,
    rangeError,
    isLoading,
    error,
    reloadStatistics,
  } = useStatistics();

  //за выбранный период нет ни выполненных задач, ни фокуса
  const isEmpty =
    statistics.completed + statistics.failed === 0 && statistics.focusSeconds === 0;

  function getActivityHint(): string {
    const what = statistics.activityUnit === "week" ? "по неделям" : "по дням";

    if (period === "all") return `Выполнено задач ${what}, последние 12 недель`;
    if (period === "range") return `Выполнено задач ${what} за выбранные даты`;
    return `Выполнено задач ${what}, последние ${statistics.activity.length} дней`;
  }

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <div>
          <h1>Статистика</h1>
          <p>Считается из задач и фокус-сессий — без гонки, просто чтобы видеть свой ритм.</p>
        </div>

        {/* выбор периода — те же варианты, что были в выпадающем списке */}
        <div className="statistics-periods" role="group" aria-label="Период">
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === period ? "statistics-period statistics-period-active" : "statistics-period"}
              aria-pressed={item === period}
              onClick={() => setPeriod(item)}
            >
              {PERIOD_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {/* произвольный диапазон дат */}
      {period === "range" && (
        <div className="statistics-range">
          <label>
            с
            <input
              type="date"
              value={range.from}
              onChange={(event) => setRange({ ...range, from: event.target.value })}
            />
          </label>

          <label>
            по
            <input
              type="date"
              value={range.to}
              onChange={(event) => setRange({ ...range, to: event.target.value })}
            />
          </label>

          {rangeError && <span className="statistics-range-error">{rangeError}</span>}
        </div>
      )}

      {error && (
        <div className="statistics-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={() => void reloadStatistics()}>
            Повторить
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="statistics-cards">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="statistics-skeleton" />
          ))}
        </div>
      ) : (
        <>
          <section className="statistics-cards" aria-label="Общая статистика">
            <StatCard
              label="Очки"
              value={statistics.points}
              hint={`за всё время — ${statistics.totalPoints}`}
            />

            <StatCard
              label="Выполнено задач"
              value={statistics.completed}
              hint={`ещё активных: ${statistics.active}`}
            />

            <StatCard
              label="Не выполнено задач"
              value={statistics.failed}
              hint={`доля выполненных — ${statistics.completionRate}%`}
            />

            <StatCard
              label="Время фокуса"
              value={statistics.focusSeconds === 0 ? "0 мин" : formatDuration(statistics.focusSeconds)}
              hint="без учёта пауз"
            />
          </section>

          {isEmpty && !error && (
            <div className="statistics-empty">
              <p>Пока нет данных. Выполните первую задачу.</p>

              <Link to="/">Перейти к задачам</Link>
            </div>
          )}

          <StreakBanner
            streakDays={statistics.streakDays}
            bestDay={statistics.bestDay}
          />

          <div className="statistics-panels">
            <section className="statistics-panel statistics-panel-wide">
              <h2>Активность</h2>
              <p className="statistics-panel-hint">{getActivityHint()}</p>

              <ActivityChart
                activity={statistics.activity}
                unit={statistics.activityUnit}
              />
            </section>

            <section className="statistics-panel">
              <h2>По сложности</h2>
              <p className="statistics-panel-hint">Выполнено задач</p>

              <BarList
                ariaLabel="Выполнено задач по сложности"
                items={[
                  { label: DIFFICULTY_LABELS.easy, value: statistics.byDifficulty.easy },
                  { label: DIFFICULTY_LABELS.medium, value: statistics.byDifficulty.medium },
                  { label: DIFFICULTY_LABELS.hard, value: statistics.byDifficulty.hard },
                ]}
              />
            </section>

            <section className="statistics-panel">
              <h2>По категориям</h2>
              <p className="statistics-panel-hint">Выполнено задач</p>

              {statistics.byCategory.length === 0 ? (
                <p className="statistics-panel-empty">За этот период пока ничего не сгорело</p>
              ) : (
                <BarList
                  ariaLabel="Выполнено задач по категориям"
                  items={statistics.byCategory.map((item) => ({
                    label: item.category,
                    value: item.completed,
                  }))}
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default StatisticsPage;
