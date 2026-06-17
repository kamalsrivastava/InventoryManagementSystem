import apiClient from "../client.js";

export const dashboardApi = {
  summary: () => apiClient.get("/dashboard/summary").then((r) => r.data),
};
