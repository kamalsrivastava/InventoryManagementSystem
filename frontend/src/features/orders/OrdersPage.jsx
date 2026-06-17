import { useMemo, useState } from "react";
import { useOrders } from "./useOrders.js";
import OrderForm from "./OrderForm.jsx";
import OrderDetail from "./OrderDetail.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { ordersApi } from "../../api/services/orders.js";
import { formatCurrency } from "../../utils/format.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function OrdersPage() {
  const toast = useToast();
  const { orders, products, customers, loading, reload } = useOrders();
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const customerName = useMemo(() => {
    const map = Object.fromEntries(customers.map((c) => [c.id, c.full_name]));
    return (id) => map[id] || `#${id}`;
  }, [customers]);

  const onSaved = () => {
    setShowForm(false);
    reload();
  };

  const openDetail = async (id) => {
    try {
      setDetail(await ordersApi.get(id));
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await ordersApi.remove(deleteTarget.id);
      toast.success("Order cancelled & stock restored");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "id", header: "Order #", render: (o) => `#${o.id}` },
    { key: "customer", header: "Customer", render: (o) => customerName(o.customer_id) },
    { key: "items", header: "Items", render: (o) => o.items.length },
    { key: "total_amount", header: "Total", render: (o) => formatCurrency(o.total_amount) },
    { key: "status", header: "Status", render: (o) => <Badge>{o.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      width: 160,
      render: (o) => (
        <div className="row-actions">
          <Button variant="link" size="sm" onClick={() => openDetail(o.id)}>
            View
          </Button>
          <Button
            variant="link"
            size="sm"
            style={{ color: "var(--danger)" }}
            onClick={() => setDeleteTarget(o)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <Button onClick={() => setShowForm(true)}>+ Create Order</Button>
      </div>

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState>No orders yet. Create your first one.</EmptyState>
      ) : (
        <DataTable columns={columns} rows={orders} />
      )}

      {showForm && (
        <OrderForm
          products={products}
          customers={customers}
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}

      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${deleteTarget.id}? Reserved stock will be returned to inventory.`}
          confirmLabel="Cancel Order"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
