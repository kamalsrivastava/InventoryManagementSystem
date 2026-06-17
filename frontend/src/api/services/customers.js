import apiClient from "../client.js";

export const customersApi = {
  list: () => apiClient.get("/customers").then((r) => r.data),
  get: (id) => apiClient.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => apiClient.post("/customers", data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/customers/${id}`).then((r) => r.data),
};
