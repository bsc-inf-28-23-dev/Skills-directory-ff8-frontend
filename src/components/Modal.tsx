import { type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal d-block" 
        tabIndex={-1} 
        role="dialog" 
        style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 0, border: "none", padding: "10px" }}>
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title display-heading" style={{ fontSize: "28px" }}>
                {title}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body py-4" style={{ textAlign: "left" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}