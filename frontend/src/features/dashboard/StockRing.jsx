import { useEffect, useState } from "react";

/** Animated conic-gradient donut showing the % of products at healthy stock. */
export default function StockRing({ percent }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVal(percent));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  return (
    <div className="ring-wrap">
      <div className="ring" style={{ "--val": val }}>
        <div className="ring-center">
          <div className="pct">{Math.round(percent)}%</div>
          <div className="pct-label">Healthy stock</div>
        </div>
      </div>
      <div className="legend">
        <span>
          <i className="dot" style={{ background: "var(--primary)" }} /> Healthy
        </span>
        <span>
          <i className="dot" style={{ background: "#eceef3" }} /> Low / out
        </span>
      </div>
    </div>
  );
}
