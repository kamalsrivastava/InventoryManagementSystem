import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

export default function OrderDetail({ order, onClose }) {
  const columns = [
    { key: "product_name", header: "Product" },
    { key: "quantity", header: "Qty" },
    { key: "unit_price", header: "Unit Price", render: (i) => formatCurrency(i.unit_price) },
    { key: "line_total", header: "Line Total", render: (i) => formatCurrency(i.line_total) },
  ];

  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <p style={{ marginTop: 0 }}>
        <strong>Customer:</strong> {order.customer_name}
        <br />
        <strong>Status:</strong> {order.status}
        <br />
        <strong>Placed:</strong> {formatDateTime(order.created_at)}
      </p>
      <DataTable columns={columns} rows={order.items} />
      <div style={{ textAlign: "right", fontWeight: 700, marginTop: 14 }}>
        Total: {formatCurrency(order.total_amount)}
      </div>
    </Modal>
  );
}
