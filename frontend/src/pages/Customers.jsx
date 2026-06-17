import { useEffect, useState } from "react";
import { CustomersAPI, extractError } from "../api/client.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/Toast.jsx";

const empty = { full_name: "", email: "", phone: "" };
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  if (!emailRe.test(form.email)) errors.email = "A valid email is required";
  if (form.phone.trim().length < 3) errors.phone = "Phone number is required";
  return errors;
}

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    CustomersAPI.list()
      .then(setCustomers)
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setForm(empty);
    setErrors({});
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await CustomersAPI.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      toast.success("Customer created");
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
      await CustomersAPI.remove(deleteTarget.id);
      toast.success("Customer deleted");
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
        <h2>Customers</h2>
        <button className="btn" onClick={openCreate}>
          + Add Customer
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading customers…</div>
      ) : customers.length === 0 ? (
        <div className="card empty">No customers yet. Add your first one.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button
                      className="btn link sm"
                      style={{ color: "var(--danger)" }}
                      onClick={() => setDeleteTarget(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Customer" onClose={() => setShowForm(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Full Name</label>
              <input value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe" />
              {errors.full_name && <div className="error-text">{errors.full_name}</div>}
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@example.com"
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+1 555 123 4567" />
              {errors.phone && <div className="error-text">{errors.phone}</div>}
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
          title="Delete Customer"
          message={`Delete "${deleteTarget.full_name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
