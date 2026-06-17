export default function FormField({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
