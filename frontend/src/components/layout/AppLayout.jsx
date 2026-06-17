import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">{children}</main>
    </div>
  );
}
