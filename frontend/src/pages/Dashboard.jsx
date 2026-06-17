import { useEffect, useState } from "react";
import { DashboardAPI, extractError } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";

export default function Dashboard() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardAPI.summary()
      .then(setSummary)
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (!summary) return <div className="empty">Could not load dashboard.</div>;

  const cards = [
    { label: "Total Products", value: summary.total_products },
    { label: "Total Customers", value: summary.total_customers },
    { label: "Total Orders", value: summary.total_orders },
    { label: "Low Stock", value: summary.low_stock_count, warning: true },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card${c.warning ? " warning" : ""}`}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Low Stock Products</h3>
        {summary.low_stock_products.length === 0 ? (
          <div className="empty">All products are well stocked. 🎉</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>
                      <span className="badge low">{p.quantity} left</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
