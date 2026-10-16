import type { ReactNode } from "react";

export default function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow mb-3">{children}</div>;
}