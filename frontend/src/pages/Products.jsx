import { useEffect, useState } from "react";
import { ProductsAPI, extractError } from "../api/client.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/Toast.jsx";

const empty = { name: "", sku: "", price: "", quantity: "" };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (form.price === "" || Number(form.price) < 0)
    errors.price = "Price must be 0 or greater";
  if (form.quantity === "" || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0)
    errors.quantity = "Quantity must be a non-negative whole number";
  return errors;
}

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    ProductsAPI.list()
      .then(setProducts)
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity });
    setErrors({});
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };
    setSaving(true);
    try {
      if (editing) {
        await ProductsAPI.update(editing.id, payload);
        toast.success("Product updated");
      } else {
        await ProductsAPI.create(payload);
        toast.success("Product created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await ProductsAPI.remove(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="card empty">No products yet. Add your first one.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity <= 10 ? "low" : "ok"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn link sm" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        className="btn link sm"
                        style={{ color: "var(--danger)" }}
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit Product" : "Add Product"}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={submit}>
            <div className="field">
              <label>Product Name</label>
              <input value={form.name} onChange={set("name")} placeholder="Wireless Mouse" />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>
            <div className="field">
              <label>SKU / Code</label>
              <input value={form.sku} onChange={set("sku")} placeholder="WM-001" />
              {errors.sku && <div className="error-text">{errors.sku}</div>}
            </div>
            <div className="field">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={set("price")}
                placeholder="19.99"
              />
              {errors.price && <div className="error-text">{errors.price}</div>}
            </div>
            <div className="field">
              <label>Quantity in Stock</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={set("quantity")}
                placeholder="100"
              />
              {errors.quantity && <div className="error-text">{errors.quantity}</div>}
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
