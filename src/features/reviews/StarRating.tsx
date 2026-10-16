import { useState, type KeyboardEvent } from "react";
import { Star } from "lucide-react";

interface DisplayProps {
  value: number;
  size?: string; // kept for API compatibility; internally mapped to px
}

/** Read-only star display. Supports half stars for averages. */
export function StarDisplay({ value, size = "1rem" }: DisplayProps) {
  const px = parseFloat(size) <= 2 ? `${parseFloat(size) * 16}px` : size;
  return (
    <span
      className="star-display"
      style={{ fontSize: px, display: "inline-flex", gap: 2 }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n - 0.25;
        const half = !filled && value >= n - 0.75;
        return (
          <Star
            key={n}
            size={parseFloat(px)}
            strokeWidth={1.5}
            fill={filled || half ? "currentColor" : "none"}
            style={{ color: filled || half ? "var(--primary)" : "#c9c6c0" }}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
}

interface InputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  labelledBy?: string;
  describedBy?: string;
}

/** Accessible 1-5 star input: arrow keys move the selection, Tab leaves the group. */
export function StarInput({ value, onChange, disabled, invalid, labelledBy, describedBy }: InputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (value || 2) - 1));
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="star-input d-inline-flex"
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          disabled={disabled}
          className="btn-star"
          onClick={() => onChange(n)}
          onMouseEnter={() => !disabled && setHover(n)}
        >
          <Star
            size={28}
            strokeWidth={1.5}
            fill={n <= shown ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}