import { productsApi } from "../../api/services/products.js";
import { useAsync } from "../../hooks/useAsync.js";

export function useProducts() {
  const { data, loading, reload } = useAsync(() => productsApi.list(), []);
  return { products: data || [], loading, reload };
}
