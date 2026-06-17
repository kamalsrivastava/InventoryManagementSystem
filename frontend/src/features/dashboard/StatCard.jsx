export default function StatCard({ label, value, warning }) {
  return (
    <div className={`stat-card${warning ? " warning" : ""}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
