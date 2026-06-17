import axios from "axios";

// The browser calls the backend directly. Base URL is injected at build time
// via VITE_API_URL (falls back to localhost for local dev).
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export default apiClient;
