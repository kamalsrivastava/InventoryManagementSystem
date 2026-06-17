import apiClient from "../client.js";

export const ordersApi = {
  list: () => apiClient.get("/orders").then((r) => r.data),
  get: (id) => apiClient.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => apiClient.post("/orders", data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/orders/${id}`).then((r) => r.data),
};
