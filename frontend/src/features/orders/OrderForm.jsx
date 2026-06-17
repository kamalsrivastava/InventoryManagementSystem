import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import { ordersApi } from "../../api/services/orders.js";
import { formatCurrency } from "../../utils/format.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

const blankLine = () => ({ product_id: "", quantity: 1 });

export default function OrderForm({ products, customers, onClose, onSaved }) {
  const toast = useToast();
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([blankLine()]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [String(p.id), p])),
    [products]
  );

  const updateLine = (idx, key, value) =>
    setLines((current) => current.map((l, i) => (i === idx ? { ...l, [key]: value } : l)));
  const addLine = () => setLines((current) => [...current, blankLine()]);
  const removeLine = (idx) => setLines((current) => current.filter((_, i) => i !== idx));

  const estimatedTotal = lines.reduce((sum, line) => {
    const product = productById[line.product_id];
    return product ? sum + Number(product.price) * Number(line.quantity || 0) : sum;
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
      await ordersApi.create({ customer_id: Number(customerId), items });
      toast.success("Order created");
      onSaved();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create Order" onClose={onClose}>
      <form onSubmit={submit}>
        <FormField label="Customer">
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
        </FormField>

        <label className="field" style={{ marginBottom: 8 }}>
          Products
        </label>
        <div className="order-items-editor">
          {lines.map((line, idx) => {
            const product = productById[line.product_id];
            const overStock = product && Number(line.quantity) > product.quantity;
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
                        {p.name} — {formatCurrency(p.price)} ({p.quantity} in stock)
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                >
                  ✕
                </Button>
                {overStock && (
                  <div className="error-text" style={{ gridColumn: "1 / -1" }}>
                    Only {product.quantity} of “{product.name}” in stock
                  </div>
                )}
              </div>
            );
          })}
          <Button variant="secondary" size="sm" onClick={addLine}>
            + Add product
          </Button>
        </div>

        <div style={{ textAlign: "right", fontWeight: 700, margin: "12px 0" }}>
          Estimated total: {formatCurrency(estimatedTotal)}
        </div>

        {formError && <div className="error-text">{formError}</div>}

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Placing…" : "Place Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
