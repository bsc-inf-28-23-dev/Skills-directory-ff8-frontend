export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="d-flex align-items-center gap-2 py-5 text-muted-ink" role="status">
      <span
        className="spinner-border spinner-border-sm"
        style={{ color: "var(--primary)" }}
        aria-hidden="true"
      />
      <span className="small text-uppercase" style={{ letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}