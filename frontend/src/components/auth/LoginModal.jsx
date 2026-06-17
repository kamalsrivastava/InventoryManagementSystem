import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { extractError } from "../../utils/apiError.js";

export default function LoginModal({ onClose }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Signed in");
      } else {
        await register(form.email, form.password);
        toast.success("Account created");
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={mode === "login" ? "Sign in" : "Create account"} onClose={onClose}>
      <p style={{ marginTop: 0, color: "var(--muted)", fontSize: 14 }}>
        {mode === "login"
          ? "Sign in to add, edit, or delete records. Viewing is open to everyone."
          : "Create an account to manage inventory and orders."}
      </p>
      <form onSubmit={submit}>
        <FormField label="Email">
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            autoFocus
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="At least 6 characters"
          />
        </FormField>
        <div className="form-actions">
          <Button type="submit" disabled={busy}>
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </div>
      </form>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 14 }}>
        {mode === "login" ? (
          <span>
            No account?{" "}
            <button className="btn link" type="button" onClick={() => setMode("register")}>
              Create one
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{" "}
            <button className="btn link" type="button" onClick={() => setMode("login")}>
              Sign in
            </button>
          </span>
        )}
      </div>
    </Modal>
  );
}
