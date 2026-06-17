import Modal from "./Modal.jsx";

export default function ConfirmDialog({ title, message, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div className="form-actions">
        <button className="btn secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
