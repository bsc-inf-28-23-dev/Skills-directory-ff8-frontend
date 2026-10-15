import { AlertTriangle } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: Props) {
  return (
    <div className="alert-error d-flex align-items-center justify-content-between gap-3" role="alert">
      <span className="d-flex align-items-center gap-2">
        <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
        {message}
      </span>
      {onRetry && (
        <button type="button" className="btn btn-trade btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}