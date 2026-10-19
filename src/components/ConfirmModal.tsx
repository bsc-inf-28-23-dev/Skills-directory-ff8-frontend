import { useEffect, useRef } from "react";

interface Props {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Bootstrap-styled confirmation dialog, controlled by React state.
 * Square corners, ink title, athletic confirm button — matches the Figma.
 */
export default function ConfirmModal({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, busy, onCancel]);

  if (!show) return null;

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{ borderRadius: 0, border: "1px solid var(--border)" }}
          >
            <div className="modal-header" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2
                className="display-heading display-heading-md"
                id="confirm-modal-title"
                style={{ fontSize: 20 }}
              >
                {title}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
                disabled={busy}
              />
            </div>
            <div className="modal-body">{message}</div>
            <div className="modal-footer" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                ref={cancelRef}
                type="button"
                className="btn btn-trade"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-athletic"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy && (
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                )}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}