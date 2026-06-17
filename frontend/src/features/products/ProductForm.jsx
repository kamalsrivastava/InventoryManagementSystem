import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import { productsApi } from "../../api/services/products.js";
import { validateProduct } from "../../utils/validators.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

const emptyForm = { name: "", sku: "", price: "", quantity: "" };

export default function ProductForm({ product, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(product);
  const [form, setForm] = useState(
    product
      ? { name: product.name, sku: product.sku, price: product.price, quantity: product.quantity }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProduct(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await productsApi.update(product.id, payload);
        toast.success("Product updated");
      } else {
        await productsApi.create(payload);
        toast.success("Product created");
      }
      onSaved();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Product" : "Add Product"} onClose={onClose}>
      <form onSubmit={submit}>
        <FormField label="Product Name" error={errors.name}>
          <input value={form.name} onChange={set("name")} placeholder="Wireless Mouse" />
        </FormField>
        <FormField label="SKU / Code" error={errors.sku}>
          <input value={form.sku} onChange={set("sku")} placeholder="WM-001" />
        </FormField>
        <FormField label="Price" error={errors.price}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={set("price")}
            placeholder="1499"
          />
        </FormField>
        <FormField label="Quantity in Stock" error={errors.quantity}>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={set("quantity")}
            placeholder="100"
          />
        </FormField>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
