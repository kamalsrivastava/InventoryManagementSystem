import { useMemo, useState } from "react";
import { Plus, Eye, XCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useOrders } from "./useOrders.js";
import OrderForm from "./OrderForm.jsx";
import OrderDetail from "./OrderDetail.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import { SkeletonTable } from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { ordersApi } from "../../api/services/orders.js";
import { formatCurrency } from "../../utils/format.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function OrdersPage() {
  const toast = useToast();
  const { requireAuth } = useAuth();
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
    {
      key: "total_amount",
      header: "Total",
      render: (o) => <strong>{formatCurrency(o.total_amount)}</strong>,
    },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge tone="ok">
          <CheckCircle2 size={13} /> {o.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: 170,
      render: (o) => (
        <div className="row-actions">
          <Button variant="link" size="sm" onClick={() => openDetail(o.id)}>
            <Eye size={14} /> View
          </Button>
          <Button
            variant="link"
            size="sm"
            style={{ color: "var(--danger)" }}
            onClick={() => requireAuth(() => setDeleteTarget(o))}
          >
            <XCircle size={14} /> Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p className="subtitle">{orders.length} orders placed</p>
        </div>
        <Button onClick={() => requireAuth(() => setShowForm(true))}>
          <Plus size={17} /> Create Order
        </Button>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart}>No orders yet. Create your first one.</EmptyState>
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
