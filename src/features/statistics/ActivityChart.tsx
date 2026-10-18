import { useState } from "react";

import type { DayActivity } from "../../types/statistics";
import { formatShortDate, formatWeekday, isToday } from "./statisticsUtils";
import { plural } from "../tasks/taskUtils";

import "./ActivityChart.css";

interface ActivityChartProps {
  activity: DayActivity[];
  unit: "day" | "week";
}

//верх шкалы — «круглое» число, чтобы подписи были целыми: 4, 6, 8 …
function getScaleMax(values: number[]): number {
  const max = Math.max(...values, 0);
  return max <= 4 ? 4 : Math.ceil(max / 2) * 2;
}

//подпись под столбиком; на длинном графике подписываем не каждый, чтобы не было каши
function getAxisLabel(item: DayActivity, index: number, total: number, unit: "day" | "week"): string {
  if (unit === "week") {
    return index % 3 === 0 || index === total - 1 ? formatShortDate(item.date) : "";
  }

  if (total <= 7) {
    return isToday(item.date) ? "сегодня" : formatWeekday(item.date);
  }

  if (isToday(item.date)) {
    return "сегодня";
  }

  //на месячном графике — каждый пятый день, но не вплотную к «сегодня»
  return index % 5 === 0 && index < total - 3 ? formatShortDate(item.date) : "";
}

//текст подсказки и подписи для экранных дикторов
function describe(item: DayActivity, unit: "day" | "week"): string {
  const when = unit === "week" ? `неделя с ${formatShortDate(item.date)}` : formatShortDate(item.date);
  return `${when}: ${item.completed} ${plural(item.completed, ["задача", "задачи", "задач"])}`;
}

//столбчатый график: сколько задач выполнено в каждый день (или неделю)

export default function ActivityChart({ activity, unit }: ActivityChartProps) {
  //над каким столбиком курсор (или фокус с клавиатуры)
  const [hovered, setHovered] = useState<number | null>(null);

  const scaleMax = getScaleMax(activity.map((item) => item.completed));
  const ticks = [scaleMax, scaleMax / 2, 0];

  const hoveredItem = hovered === null ? null : activity[hovered];

  return (
    <div className="activity-chart">
      <div className="activity-plot" onMouseLeave={() => setHovered(null)}>
        {/* горизонтальные линии шкалы с подписями слева */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="activity-gridline"
            style={{ bottom: `${(tick / scaleMax) * 100}%` }}
          >
            <span>{tick}</span>
          </div>
        ))}

        <div className="activity-columns">
          {activity.map((item, index) => (
            <div
              key={item.date}
              className={hovered === index ? "activity-slot activity-slot-hovered" : "activity-slot"}
              tabIndex={0}
              aria-label={describe(item, unit)}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
            >
              <span
                className="activity-bar"
                style={{ height: `${(item.completed / scaleMax) * 100}%` }}
              />
            </div>
          ))}
        </div>

        {hoveredItem && hovered !== null && (
          <div
            className="activity-tooltip"
            style={{ left: `${((hovered + 0.5) / activity.length) * 100}%` }}
            role="status"
          >
            {describe(hoveredItem, unit)}
          </div>
        )}
      </div>

      <div className="activity-axis" aria-hidden="true">
        {activity.map((item, index) => (
          <span
            key={item.date}
            className={isToday(item.date) && unit === "day" ? "activity-axis-today" : undefined}
          >
            {getAxisLabel(item, index, activity.length, unit)}
          </span>
        ))}
      </div>
    </div>
  );
}
