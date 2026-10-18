import "./BarList.css";

export interface BarListItem {
  label: string;
  value: number;
}

interface BarListProps {
  items: BarListItem[];
  //подпись для экранных дикторов, например «Выполнено задач по сложности»
  ariaLabel: string;
}

//горизонтальные полосы: подпись слева, полоса, число справа.
//Длина полосы — доля от самого большого значения в списке.

export default function BarList({ items, ariaLabel }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <ul className="bar-list" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.label} className="bar-list-row">
          <span className="bar-list-label">{item.label}</span>

          <span className="bar-list-track">
            <span
              className="bar-list-fill"
              style={{ width: max === 0 ? "0%" : `${(item.value / max) * 100}%` }}
            />
          </span>

          <span className="bar-list-value">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
