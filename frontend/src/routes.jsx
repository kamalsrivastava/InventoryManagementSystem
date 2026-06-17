import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./features/dashboard/DashboardPage.jsx";
import ProductsPage from "./features/products/ProductsPage.jsx";
import CustomersPage from "./features/customers/CustomersPage.jsx";
import OrdersPage from "./features/orders/OrdersPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
