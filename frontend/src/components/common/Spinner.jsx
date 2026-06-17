export default function Spinner({ label }) {
  return (
    <div className="loading">
      <div className="spinner" />
      {label && <div style={{ marginTop: 14 }}>{label}</div>}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-row" style={{ width: "40%" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i} style={{ width: `${90 - i * 6}%` }} />
      ))}
    </div>
  );
}
