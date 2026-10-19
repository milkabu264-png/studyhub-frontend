import type { CampfireState } from "../../types/campfire";

interface CampfireSceneProps {
  state: CampfireState;
  //короткая вспышка, когда в костёр упало бревно
  isFlaring: boolean;
  //в режиме фокуса сцена ниже
  isCompact?: boolean;
}

//размер пламени в каждом состоянии; у потухшего костра пламени нет
const FLAME_SCALE: Record<CampfireState, number> = {
  out: 0,
  smoldering: 0.45,
  burning: 0.85,
  blazing: 1.2,
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

//ночная сцена: звёзды, ёлки и костёр в текущем состоянии

export default function CampfireScene({ state, isFlaring, isCompact = false }: CampfireSceneProps) {
  const classNames = ["campfire-scene", `campfire-scene-${state}`];

  if (isFlaring) classNames.push("campfire-scene-flaring");
  if (isCompact) classNames.push("campfire-scene-compact");

  return (
    <div className={classNames.join(" ")}>
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

      <div className="campfire-fire">
        {state !== "out" && (
          <div
            className="campfire-flames"
            style={{ transform: `translateX(-50%) scale(${FLAME_SCALE[state]})` }}
          >
            <span className="campfire-flame campfire-flame-outer" />
            <span className="campfire-flame campfire-flame-inner" />
          </div>
        )}

        {/* искры — только когда костёр пылает */}
        {state === "blazing" && (
          <div className="campfire-sparks" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}

        {/* дым — у тлеющего и потухшего костра */}
        {(state === "out" || state === "smoldering") && (
          <div className="campfire-smoke" aria-hidden="true">
            <span />
            <span />
          </div>
        )}

        <span className="campfire-logs" />
      </div>
    </div>
  );
}
