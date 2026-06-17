/**
 * Lightweight pure-CSS bar chart.
 * data: [{ label, value, low }]
 */
export default function BarChart({ data, threshold = 10 }) {
  if (!data.length) {
    return <div className="empty">No product data to chart yet.</div>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="barchart">
      {data.map((d, i) => {
        const heightPct = Math.max((d.value / max) * 100, 2);
        return (
          <div className="bar-col" key={d.label + i}>
            <div className="bar-track">
              <div
                className={`bar${d.value <= threshold ? " low" : ""}`}
                style={{ height: `${heightPct}%`, animationDelay: `${i * 0.06}s` }}
                title={`${d.label}: ${d.value} in stock`}
              >
                <span className="bar-value">{d.value}</span>
              </div>
            </div>
            <div className="bar-label" title={d.label}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
