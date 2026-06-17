import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Activity,
  PackageCheck,
} from "lucide-react";
import { useDashboard } from "./useDashboard.js";
import StatCard from "./StatCard.jsx";
import BarChart from "./BarChart.jsx";
import StockRing from "./StockRing.jsx";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import { SkeletonTable } from "../../components/common/Spinner.jsx";

export default function DashboardPage() {
  const { summary, products, loading } = useDashboard();

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Dashboard</h2>
            <p className="subtitle">Loading your business at a glance…</p>
          </div>
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }
  if (!summary) return <div className="empty">Could not load dashboard.</div>;

  const cards = [
    {
      label: "Total Products",
      value: summary.total_products,
      icon: Package,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    },
    {
      label: "Total Customers",
      value: summary.total_customers,
      icon: Users,
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
    },
    {
      label: "Total Orders",
      value: summary.total_orders,
      icon: ShoppingCart,
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    {
      label: "Low Stock",
      value: summary.low_stock_count,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    },
  ];

  // Top products by stock for the bar chart.
  const chartData = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 7)
    .map((p) => ({ label: p.name, value: p.quantity }));

  const healthyPct =
    summary.total_products > 0
      ? ((summary.total_products - summary.low_stock_count) / summary.total_products) * 100
      : 0;

  const columns = [
    { key: "name", header: "Name" },
    { key: "sku", header: "SKU" },
    {
      key: "quantity",
      header: "Quantity",
      render: (p) => (
        <Badge tone="low">
          <AlertTriangle size={13} /> {p.quantity} left
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Your inventory & orders at a glance</p>
        </div>
      </div>

      <div className="stat-grid stagger">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card animate-in">
          <h3 className="card-title">
            <BarChart3 size={18} /> Stock Levels — Top Products
          </h3>
          <BarChart data={chartData} />
        </div>
        <div className="card animate-in">
          <h3 className="card-title">
            <Activity size={18} /> Stock Health
          </h3>
          <StockRing percent={healthyPct} />
        </div>
      </div>

      <div className="card animate-in">
        <h3 className="card-title">
          <AlertTriangle size={18} /> Low Stock Products
        </h3>
        {summary.low_stock_products.length === 0 ? (
          <div className="empty-illustration">
            <div className="circle" style={{ color: "var(--success)", background: "var(--success-soft)" }}>
              <PackageCheck size={28} />
            </div>
            <div>All products are well stocked. 🎉</div>
          </div>
        ) : (
          <DataTable columns={columns} rows={summary.low_stock_products} />
        )}
      </div>
    </div>
  );
}
