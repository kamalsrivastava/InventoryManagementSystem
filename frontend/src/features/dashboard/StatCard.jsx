import { useCountUp } from "../../hooks/useCountUp.js";

export default function StatCard({ label, value, icon: Icon, gradient }) {
  const animated = useCountUp(value);
  return (
    <div className="stat-card" style={gradient ? { "--accent-grad": gradient } : undefined}>
      <div className="stat-icon">{Icon && <Icon size={23} />}</div>
      <div className="label">{label}</div>
      <div className="value">{animated}</div>
    </div>
  );
}
