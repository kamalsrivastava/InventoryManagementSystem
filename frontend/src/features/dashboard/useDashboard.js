import { dashboardApi } from "../../api/services/dashboard.js";
import { productsApi } from "../../api/services/products.js";
import { useAsync } from "../../hooks/useAsync.js";

export function useDashboard() {
  const { data, loading } = useAsync(
    () =>
      Promise.all([dashboardApi.summary(), productsApi.list()]).then(
        ([summary, products]) => ({ summary, products })
      ),
    []
  );
  return { summary: data?.summary, products: data?.products || [], loading };
}
