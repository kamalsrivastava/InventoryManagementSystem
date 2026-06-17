import { useState } from "react";
import { useProducts } from "./useProducts.js";
import ProductForm from "./ProductForm.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { productsApi } from "../../api/services/products.js";
import { formatCurrency } from "../../utils/format.js";
import { extractError } from "../../utils/apiError.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function ProductsPage() {
  const toast = useToast();
  const { products, loading, reload } = useProducts();
  const [formState, setFormState] = useState(null); // null | {} | product
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = () => setFormState(null);
  const onSaved = () => {
    closeForm();
    reload();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "sku", header: "SKU" },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
    {
      key: "quantity",
      header: "Stock",
      render: (p) => <Badge tone={p.quantity <= 10 ? "low" : "ok"}>{p.quantity}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      width: 160,
      render: (p) => (
        <div className="row-actions">
          <Button variant="link" size="sm" onClick={() => setFormState(p)}>
            Edit
          </Button>
          <Button
            variant="link"
            size="sm"
            style={{ color: "var(--danger)" }}
            onClick={() => setDeleteTarget(p)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <Button onClick={() => setFormState({})}>+ Add Product</Button>
      </div>

      {loading ? (
        <Spinner label="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState>No products yet. Add your first one.</EmptyState>
      ) : (
        <DataTable columns={columns} rows={products} />
      )}

      {formState !== null && (
        <ProductForm
          product={formState.id ? formState : null}
          onClose={closeForm}
          onSaved={onSaved}
        />
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
