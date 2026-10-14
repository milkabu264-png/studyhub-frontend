import { useState } from "react";
import type { DragEvent } from "react";

import { TASK_DRAG_TYPE } from "../tasks/TaskCard";
import { CAMPFIRE_LABELS, getCampfire } from "./campfireUtils";
import { plural } from "../tasks/taskUtils";
import type { CampfireState } from "../../types/campfire";

import "./CampfireCard.css";

interface CampfireCardProps {
  logsToday: number;
  onBurnTask: (id: number) => void;
}

//насколько большой огонь при каждом состоянии костра
const FLAME_SCALE: Record<CampfireState, number> = {
  embers: 0.55,
  low: 0.8,
  burning: 1,
  blazing: 1.25,
};

//ёлки на фоне: [x, высота, цвет] — дальние светлее, ближние темнее
const TREES: [number, number, string][] = [
  [8, 120, "#26332a"], [40, 150, "#1d2820"], [76, 105, "#2b392f"], [108, 70, "#33433a"],
  [255, 75, "#33433a"], [286, 115, "#2b392f"], [318, 155, "#1d2820"], [350, 125, "#26332a"],
];

//одна ёлка из трёх ярусов-треугольников
function getPinePath(x: number, height: number): string {
  const base = 170;
  const width = height * 0.42;

  return [0, 1, 2]
    .map((i) => {
      const top = base - height + i * height * 0.24;
      const bottom = top + height * 0.46;
      const half = (width / 2) * (0.6 + i * 0.25);

      return `M${x} ${top} L${x + half} ${bottom} L${x - half} ${bottom} Z`;
    })
    .join(" ");
}

export default function CampfireCard({
  logsToday,
  onBurnTask,
}: CampfireCardProps) {
  //задачу держат над зоной костра
  const [isHovered, setIsHovered] = useState(false);
  //короткая вспышка огня, когда задача сгорела
  const [isFlaring, setIsFlaring] = useState(false);

  const campfire = getCampfire(logsToday);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsHovered(false);

    const id = Number(event.dataTransfer.getData(TASK_DRAG_TYPE));

    if (!id) {
      return;
    }

    onBurnTask(id);
    setIsFlaring(true);
    window.setTimeout(() => setIsFlaring(false), 900);
  }

  return (
    <section className="campfire-section">
      <h2>У вашего костра</h2>

      <div
        className={
          isFlaring ? "campfire-scene campfire-scene-flaring" : "campfire-scene"
        }
      >
        <div className="campfire-stars" />

        <svg
          className="campfire-trees"
          viewBox="0 0 360 170"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          {TREES.map(([x, height, color]) => (
            <path key={x} d={getPinePath(x, height)} fill={color} />
          ))}
          <rect x="0" y="160" width="360" height="10" fill="#2a352c" />
        </svg>

        <div
          className="campfire-fire"
          style={{
            transform: `translateX(-50%) scale(${FLAME_SCALE[campfire.state]})`,
          }}
        >
          <span className="campfire-flame campfire-flame-outer" />
          <span className="campfire-flame campfire-flame-inner" />
          <span className="campfire-logs" />
        </div>
      </div>

      <p className="campfire-state">{CAMPFIRE_LABELS[campfire.state]}</p>

      <p className="campfire-info">
        Брёвен сегодня: <strong>{campfire.logsToday}</strong>
        {campfire.nextThreshold !== null && (
          <>
            {" · "}до следующего уровня ещё{" "}
            {campfire.nextThreshold - campfire.logsToday}{" "}
            {plural(campfire.nextThreshold - campfire.logsToday, [
              "задача",
              "задачи",
              "задач",
            ])}
          </>
        )}
      </p>

      <div
        className={isHovered ? "campfire-drop campfire-drop-active" : "campfire-drop"}
        onDragOver={(event) => {
          event.preventDefault();
          setIsHovered(true);
        }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
      >
        Перетащите сюда готовую задачу
      </div>
    </section>
  );
}
