import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  return (
    <div className="app">
      <Sidebar />
      {/* .content is the only scroll container (app shell); keyed by path so
          each route mount replays the entrance animation */}
      <main className="content">
        <div className="content-inner animate-in" key={location.pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}
