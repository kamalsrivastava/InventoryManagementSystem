import { useDashboard } from "./useDashboard.js";
import StatCard from "./StatCard.jsx";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Spinner from "../../components/common/Spinner.jsx";

export default function DashboardPage() {
  const { summary, loading } = useDashboard();

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (!summary) return <div className="empty">Could not load dashboard.</div>;

  const cards = [
    { label: "Total Products", value: summary.total_products },
    { label: "Total Customers", value: summary.total_customers },
    { label: "Total Orders", value: summary.total_orders },
    { label: "Low Stock", value: summary.low_stock_count, warning: true },
  ];

  const columns = [
    { key: "name", header: "Name" },
    { key: "sku", header: "SKU" },
    {
      key: "quantity",
      header: "Quantity",
      render: (p) => <Badge tone="low">{p.quantity} left</Badge>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Low Stock Products</h3>
        {summary.low_stock_products.length === 0 ? (
          <div className="empty">All products are well stocked. 🎉</div>
        ) : (
          <DataTable columns={columns} rows={summary.low_stock_products} />
        )}
      </div>
    </div>
  );
}
