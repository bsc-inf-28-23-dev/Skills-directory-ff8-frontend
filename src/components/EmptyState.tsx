import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface Props {
  icon?: string; // kept for API compatibility; ignored in favour of Lucide
  title: string;
  children?: ReactNode;
}

export default function EmptyState({ title, children }: Props) {
  return (
    <div className="text-center py-5 px-2 border-top border-bottom">
      <Inbox size={32} strokeWidth={1.5} style={{ color: "var(--muted)" }} aria-hidden="true" />
      <p className="display-heading display-heading-md mt-3 mb-1" style={{ fontSize: 20 }}>
        {title}
      </p>
      {children && <div className="small text-muted-ink">{children}</div>}
    </div>
  );
}