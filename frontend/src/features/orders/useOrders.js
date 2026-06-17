import { ordersApi } from "../../api/services/orders.js";
import { productsApi } from "../../api/services/products.js";
import { customersApi } from "../../api/services/customers.js";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Orders depend on products & customers (needed to build an order), so we load
 * all three together.
 */
export function useOrders() {
  const { data, loading, reload } = useAsync(
    () =>
      Promise.all([ordersApi.list(), productsApi.list(), customersApi.list()]).then(
        ([orders, products, customers]) => ({ orders, products, customers })
      ),
    []
  );

  return {
    orders: data?.orders || [],
    products: data?.products || [],
    customers: data?.customers || [],
    loading,
    reload,
  };
}
