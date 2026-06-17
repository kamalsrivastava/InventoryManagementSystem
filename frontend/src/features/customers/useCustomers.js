import { customersApi } from "../../api/services/customers.js";
import { useAsync } from "../../hooks/useAsync.js";

export function useCustomers() {
  const { data, loading, reload } = useAsync(() => customersApi.list(), []);
  return { customers: data || [], loading, reload };
}
