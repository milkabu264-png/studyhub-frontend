import type { DayActivity } from "../../types/statistics";
import { formatShortDate } from "./statisticsUtils";
import { plural } from "../tasks/taskUtils";

import "./StreakBanner.css";

interface StreakBannerProps {
  streakDays: number;
  bestDay: DayActivity | null;
}

//полоса над графиками: сколько дней подряд выполнялись задачи и какой день был самым продуктивным

export default function StreakBanner({ streakDays, bestDay }: StreakBannerProps) {
  return (
    <section className="streak-banner" aria-label="Серия дней">
      <span className="streak-banner-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c.5 3 3 4.5 4.5 7a6.5 6.5 0 1 1-11.6 1.5c.6 1 1.6 1.7 2.6 1.9C7 10 9.5 6.5 12 3Z" />
        </svg>
      </span>

      <div className="streak-banner-main">
        {streakDays > 0 ? (
          <>
            <strong>
              {streakDays} {plural(streakDays, ["день", "дня", "дней"])} подряд с выполненными задачами
            </strong>
            <span>Каждый день хотя бы одна задача отправилась в костёр.</span>
          </>
        ) : (
          <>
            <strong>Серия ещё не началась</strong>
            <span>Выполните одну задачу сегодня — и она начнётся.</span>
          </>
        )}
      </div>

      {bestDay && (
        <div className="streak-banner-best">
          <span>Лучший день за период</span>
          <strong>
            {formatShortDate(bestDay.date)} — {bestDay.completed}{" "}
            {plural(bestDay.completed, ["задача", "задачи", "задач"])}
          </strong>
        </div>
      )}
    </section>
  );
}
