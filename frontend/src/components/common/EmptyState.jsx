import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, children }) {
  return (
    <div className="card">
      <div className="empty-illustration">
        <div className="circle">
          <Icon size={28} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
