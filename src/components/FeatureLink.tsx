import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  enabled: boolean;
  className?: string;
  children: ReactNode;
}

export default function FeatureLink({ to, enabled, className = "btn btn-athletic", children }: Props) {
  if (enabled) {
    return <Link to={to} className={className}>{children}</Link>;
  }
  return (
    <button type="button" className={className} disabled aria-disabled="true" title="This page is not available yet">
      {children}
    </button>
  );
}