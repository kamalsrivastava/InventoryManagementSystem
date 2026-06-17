import { User, CalendarClock, CheckCircle2 } from "lucide-react";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

export default function OrderDetail({ order, onClose }) {
  const columns = [
    { key: "product_name", header: "Product" },
    { key: "quantity", header: "Qty" },
    { key: "unit_price", header: "Unit Price", render: (i) => formatCurrency(i.unit_price) },
    {
      key: "line_total",
      header: "Line Total",
      render: (i) => <strong>{formatCurrency(i.line_total)}</strong>,
    },
  ];

  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <div className="detail-meta">
        <div className="meta-item">
          <div className="k">
            <User size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />
            Customer
          </div>
          <div className="v">{order.customer_name}</div>
        </div>
        <div className="meta-item">
          <div className="k">
            <CheckCircle2 size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />
            Status
          </div>
          <div className="v" style={{ textTransform: "capitalize" }}>
            {order.status}
          </div>
        </div>
        <div className="meta-item">
          <div className="k">
            <CalendarClock size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />
            Placed
          </div>
          <div className="v">{formatDateTime(order.created_at)}</div>
        </div>
      </div>

      <DataTable columns={columns} rows={order.items} />

      <div className="order-total" style={{ marginBottom: 0 }}>
        <span>Order total</span>
        <span className="amount">{formatCurrency(order.total_amount)}</span>
      </div>
    </Modal>
  );
}
