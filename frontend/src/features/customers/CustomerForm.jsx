import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import { customersApi } from "../../api/services/customers.js";
import { validateCustomer } from "../../utils/validators.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

const emptyForm = { full_name: "", email: "", phone: "" };

export default function CustomerForm({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateCustomer(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSaving(true);
    try {
      await customersApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      toast.success("Customer created");
      onSaved();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add Customer" onClose={onClose}>
      <form onSubmit={submit}>
        <FormField label="Full Name" error={errors.full_name}>
          <input value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe" />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@example.com"
          />
        </FormField>
        <FormField label="Phone" error={errors.phone}>
          <input value={form.phone} onChange={set("phone")} placeholder="+1 555 123 4567" />
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
