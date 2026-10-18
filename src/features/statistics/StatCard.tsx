import "./StatCard.css";

interface StatCardProps {
  label: string;
  value: string | number;
  //короткое пояснение под числом
  hint?: string;
}

//плитка с одним числом: «Очки», «Выполнено задач» и т.д.

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <strong className="stat-card-value">{value}</strong>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}
