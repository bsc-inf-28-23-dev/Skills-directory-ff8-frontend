interface Props {
  value: number | string;
  label: string;
}

export default function StatCard({ value, label }: Props) {
  return (
    <div className="stat-card h-100">
      <span className="stat-card-number">{value}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}