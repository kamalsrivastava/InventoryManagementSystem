import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Boxes,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];

export default function Sidebar() {
  const { isAuthenticated, user, openLogin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">
          <Boxes size={22} />
        </div>
        <div className="brand-text">
          <strong>Inventory</strong>
          <span>Management</span>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="auth-box">
            <div className="auth-who">
              <span className="auth-dot" />
              <span className="auth-email" title={user?.email}>
                {user?.email || "Signed in"}
              </span>
            </div>
            <button className="btn secondary sm auth-btn" onClick={logout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        ) : (
          <div className="auth-box">
            <span style={{ color: "#a5b4fc", fontSize: 12 }}>
              Viewing as guest · sign in to manage
            </span>
            <button className="btn sm auth-btn" onClick={() => openLogin()}>
              <LogIn size={15} /> Sign in
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
