import { dashboardApi } from "../../api/services/dashboard.js";
import { useAsync } from "../../hooks/useAsync.js";

export function useDashboard() {
  const { data, loading } = useAsync(() => dashboardApi.summary(), []);
  return { summary: data, loading };
}
