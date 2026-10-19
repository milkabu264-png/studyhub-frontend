import { useEffect, useState } from "react";

import type { DayMarks } from "../tasks/taskUtils";
import { parseDate, toDateString, todayString } from "../tasks/taskUtils";

import "./Calendar.css";

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  //точки под числами: есть ли задачи в этот день и какие
  marks: Map<string, DayMarks>;
}

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

//"2026-10" — первый день месяца выбранной даты
function monthOf(date: string): string {
  return date.slice(0, 7);
}

function shiftMonth(month: string, delta: number): string {
  const date = parseDate(`${month}-01`);
  date.setMonth(date.getMonth() + delta);
  return monthOf(toDateString(date));
}

//все дни сетки месяца, начиная с понедельника; null — пустая клетка до 1-го числа
function getMonthDays(month: string): (string | null)[] {
  const first = parseDate(`${month}-01`);
  const offset = (first.getDay() + 6) % 7;
  const days: (string | null)[] = Array.from({ length: offset }, () => null);

  const current = new Date(first);

  while (monthOf(toDateString(current)) === month) {
    days.push(toDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function describeDay(date: string, mark: DayMarks | undefined): string {
  const label = parseDate(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  if (!mark) return label;

  const parts = [];
  if (mark.active) parts.push(`активных: ${mark.active}`);
  if (mark.completed) parts.push(`выполнено: ${mark.completed}`);
  if (mark.overdue) parts.push(`просрочено: ${mark.overdue}`);

  return `${label}, ${parts.join(", ")}`;
}

//календарь под костром (п. 1.2.8): выбор дня, листание месяцев, кнопка «Сегодня»

export default function Calendar({ selectedDate, onSelect, marks }: CalendarProps) {
  const [month, setMonth] = useState(monthOf(selectedDate));
  const today = todayString();

  //выбрали день в другом месяце (стрелками у даты) — показываем его месяц
  useEffect(() => {
    setMonth(monthOf(selectedDate));
  }, [selectedDate]);

  const title = parseDate(`${month}-01`).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="calendar" aria-label="Календарь">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-arrow"
          aria-label="Предыдущий месяц"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ‹
        </button>

        <h2>{title.charAt(0).toUpperCase() + title.slice(1).replace(" г.", "")}</h2>

        <button
          type="button"
          className="calendar-arrow"
          aria-label="Следующий месяц"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-grid" role="grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar-weekday">{day}</span>
        ))}

        {getMonthDays(month).map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} />;
          }

          const mark = marks.get(date);
          const classNames = ["calendar-day"];

          if (date === selectedDate) classNames.push("calendar-day-selected");
          if (date === today) classNames.push("calendar-day-today");
          if (date < today) classNames.push("calendar-day-past");

          return (
            <button
              key={date}
              type="button"
              className={classNames.join(" ")}
              aria-label={describeDay(date, mark)}
              aria-pressed={date === selectedDate}
              onClick={() => onSelect(date)}
            >
              {Number(date.slice(8))}

              {/* точки: красная — просрочено, оранжевая — есть активные, зелёная — всё выполнено */}
              {mark && (
                <span className="calendar-dots" aria-hidden="true">
                  {mark.overdue > 0 && <i className="calendar-dot-overdue" />}
                  {mark.overdue === 0 && mark.active > 0 && <i className="calendar-dot-active" />}
                  {mark.completed > 0 && <i className="calendar-dot-done" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-footer">
        <span className="calendar-legend">
          <i className="calendar-dot-active" /> есть задачи
          <i className="calendar-dot-done" /> выполнено
          <i className="calendar-dot-overdue" /> просрочено
        </span>

        <button
          type="button"
          className="calendar-today"
          disabled={selectedDate === today}
          onClick={() => onSelect(today)}
        >
          Сегодня
        </button>
      </div>
    </section>
  );
}
