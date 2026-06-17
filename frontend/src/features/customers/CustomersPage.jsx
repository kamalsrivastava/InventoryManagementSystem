import { useState } from "react";
import { useCustomers } from "./useCustomers.js";
import CustomerForm from "./CustomerForm.jsx";
import Button from "../../components/common/Button.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { customersApi } from "../../api/services/customers.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function CustomersPage() {
  const toast = useToast();
  const { customers, loading, reload } = useCustomers();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const onSaved = () => {
    setShowForm(false);
    reload();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await customersApi.remove(deleteTarget.id);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "actions",
      header: "Actions",
      width: 100,
      render: (c) => (
        <Button
          variant="link"
          size="sm"
          style={{ color: "var(--danger)" }}
          onClick={() => setDeleteTarget(c)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Customer</Button>
      </div>

      {loading ? (
        <Spinner label="Loading customers…" />
      ) : customers.length === 0 ? (
        <EmptyState>No customers yet. Add your first one.</EmptyState>
      ) : (
        <DataTable columns={columns} rows={customers} />
      )}

      {showForm && <CustomerForm onClose={() => setShowForm(false)} onSaved={onSaved} />}

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
