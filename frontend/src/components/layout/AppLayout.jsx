import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  return (
    <div className="app">
      <Sidebar />
      {/* keyed by path so each route mount replays the entrance animation */}
      <main className="content animate-in" key={location.pathname}>
        {children}
      </main>
    </div>
  );
}
