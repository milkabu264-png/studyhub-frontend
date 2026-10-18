import ActivityChart from "../../features/statistics/ActivityChart";
import BarList from "../../features/statistics/BarList";
import StatCard from "../../features/statistics/StatCard";
import StreakBanner from "../../features/statistics/StreakBanner";
import useStatistics from "../../features/statistics/useStatistics";
import { PERIOD_LABELS } from "../../features/statistics/statisticsUtils";
import { DIFFICULTY_LABELS, plural } from "../../features/tasks/taskUtils";

import type { StatisticsPeriod } from "../../types/statistics";

import "./StatisticsPage.css";

// Страница «Статистика» (View).
// Все числа считает контроллер useStatistics, страница их только показывает.

const PERIODS: StatisticsPeriod[] = ["day", "week", "month", "all"];

function StatisticsPage() {
  const {
    statistics,
    period,
    setPeriod,
    isLoading,
    error,
    reloadStatistics,
  } = useStatistics();

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <div>
          <h1>Статистика</h1>
          <p>Сколько уже сгорело в костре — без гонки, просто чтобы видеть свой ритм.</p>
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
              hint="1 за лёгкую, 2 за среднюю, 3 за сложную"
            />

            <StatCard
              label="Выполнено задач"
              value={statistics.completed}
              hint={`${statistics.completed} ${plural(statistics.completed, ["бревно", "бревна", "брёвен"])} в костёр`}
            />

            <StatCard
              label="Не выполнено задач"
              value={statistics.failed}
              hint={`ещё в работе: ${statistics.active}`}
            />

            <StatCard
              label="Доля выполненных"
              value={`${statistics.completionRate}%`}
              hint="из задач, срок которых прошёл"
            />
          </section>

          <StreakBanner
            streakDays={statistics.streakDays}
            bestDay={statistics.bestDay}
          />

          <div className="statistics-panels">
            <section className="statistics-panel statistics-panel-wide">
              <h2>Активность</h2>
              <p className="statistics-panel-hint">
                {statistics.activityUnit === "week"
                  ? "Выполнено задач по неделям, последние 12 недель"
                  : `Выполнено задач по дням, последние ${statistics.activity.length} дней`}
              </p>

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
