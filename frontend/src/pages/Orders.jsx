import { useEffect, useState } from "react";
import {
  CustomersAPI,
  OrdersAPI,
  ProductsAPI,
  extractError,
} from "../api/client.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/Toast.jsx";

const blankLine = () => ({ product_id: "", quantity: 1 });

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([blankLine()]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([OrdersAPI.list(), ProductsAPI.list(), CustomersAPI.list()])
      .then(([o, p, c]) => {
        setOrders(o);
        setProducts(p);
        setCustomers(c);
      })
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const productById = (id) => products.find((p) => String(p.id) === String(id));

  const openCreate = () => {
    setCustomerId("");
    setLines([blankLine()]);
    setFormError("");
    setShowForm(true);
  };

  const updateLine = (idx, key, value) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, [key]: value } : l)));

  const addLine = () => setLines((ls) => [...ls, blankLine()]);
  const removeLine = (idx) => setLines((ls) => ls.filter((_, i) => i !== idx));

  const estimatedTotal = lines.reduce((sum, l) => {
    const p = productById(l.product_id);
    return p ? sum + Number(p.price) * Number(l.quantity || 0) : sum;
  }, 0);

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!customerId) return setFormError("Please select a customer");
    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }));
    if (items.length === 0) return setFormError("Add at least one product");
    if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1))
      return setFormError("Each quantity must be a whole number of at least 1");

    setSaving(true);
    try {
      await OrdersAPI.create({ customer_id: Number(customerId), items });
      toast.success("Order created");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setDetail(await OrdersAPI.get(id));
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await OrdersAPI.remove(deleteTarget.id);
      toast.success("Order cancelled & stock restored");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const customerName = (id) =>
    customers.find((c) => c.id === id)?.full_name || `#${id}`;

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn" onClick={openCreate}>
          + Create Order
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="card empty">No orders yet. Create your first one.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{customerName(o.customer_id)}</td>
                  <td>{o.items.length}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="badge ok">{o.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn link sm" onClick={() => openDetail(o.id)}>
                        View
                      </button>
                      <button
                        className="btn link sm"
                        style={{ color: "var(--danger)" }}
                        onClick={() => setDeleteTarget(o)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create order form */}
      {showForm && (
        <Modal title="Create Order" onClose={() => setShowForm(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <label className="field" style={{ marginBottom: 8 }}>
              Products
            </label>
            <div className="order-items-editor">
              {lines.map((line, idx) => {
                const p = productById(line.product_id);
                return (
                  <div className="order-item-row" key={idx}>
                    <div className="field" style={{ margin: 0 }}>
                      <select
                        value={line.product_id}
                        onChange={(e) => updateLine(idx, "product_id", e.target.value)}
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${Number(p.price).toFixed(2)} ({p.quantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn secondary sm"
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                    >
                      ✕
                    </button>
                    {p && Number(line.quantity) > p.quantity && (
                      <div className="error-text" style={{ gridColumn: "1 / -1" }}>
                        Only {p.quantity} of “{p.name}” in stock
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className="btn secondary sm" onClick={addLine}>
                + Add product
              </button>
            </div>

            <div style={{ textAlign: "right", fontWeight: 700, margin: "12px 0" }}>
              Estimated total: ${estimatedTotal.toFixed(2)}
            </div>

            {formError && <div className="error-text">{formError}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Placing…" : "Place Order"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Order detail */}
      {detail && (
        <Modal title={`Order #${detail.id}`} onClose={() => setDetail(null)}>
          <p style={{ marginTop: 0 }}>
            <strong>Customer:</strong> {detail.customer_name}
            <br />
            <strong>Status:</strong> {detail.status}
            <br />
            <strong>Placed:</strong> {new Date(detail.created_at).toLocaleString()}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.product_name}</td>
                    <td>{it.quantity}</td>
                    <td>${Number(it.unit_price).toFixed(2)}</td>
                    <td>${Number(it.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "right", fontWeight: 700, marginTop: 14 }}>
            Total: ${Number(detail.total_amount).toFixed(2)}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${deleteTarget.id}? Reserved stock will be returned to inventory.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
