import axios from "axios";

// The browser calls the backend directly. The base URL is injected at build
// time via VITE_API_URL (falls back to localhost for local dev).
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

// Normalise backend/validation errors into a single readable message.
export function extractError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI 422 validation errors: list of {loc, msg}.
    return detail
      .map((d) => `${d.loc?.slice(1).join(".") || "field"}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (error?.message) return error.message;
  return "Unexpected error";
}

// -------------------------- Products --------------------------
export const ProductsAPI = {
  list: () => api.get("/products").then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

// -------------------------- Customers --------------------------
export const CustomersAPI = {
  list: () => api.get("/customers").then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => api.post("/customers", data).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
};

// -------------------------- Orders --------------------------
export const OrdersAPI = {
  list: () => api.get("/orders").then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post("/orders", data).then((r) => r.data),
  remove: (id) => api.delete(`/orders/${id}`).then((r) => r.data),
};

// -------------------------- Dashboard --------------------------
export const DashboardAPI = {
  summary: () => api.get("/dashboard/summary").then((r) => r.data),
};

export default api;
